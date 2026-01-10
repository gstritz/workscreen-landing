/**
 * Logic engine for conditional question routing
 * Handles complex conditional logic from questionnaire config
 */

import { Field, Logic, LogicCondition, ResponseAnswers } from '@/types/questionnaire'

/**
 * Get next question based on current field, answers, and logic rules
 */
export function getNextQuestion(
  currentField: Field,
  answers: ResponseAnswers,
  allFields: Field[],
  logic: Logic[]
): Field | null {
  // Find logic rules for current field
  const relevantLogic = logic.find((l) => l.ref === currentField.ref)

  if (!relevantLogic) {
    // No logic, go to next sequential question
    return getNextSequentialQuestion(currentField, allFields)
  }

  // Evaluate all actions and find the first matching condition
  for (const action of relevantLogic.actions) {
    if (evaluateCondition(action.condition, answers, currentField)) {
      // Jump to specified field
      const targetFieldId = action.details?.to?.value
      if (targetFieldId) {
        const targetField = findFieldById(targetFieldId, allFields)
        if (targetField) {
          return targetField
        }
      }
    }
  }

  // Default: next sequential question
  return getNextSequentialQuestion(currentField, allFields)
}

/**
 * Get next question in sequence
 */
function getNextSequentialQuestion(
  currentField: Field,
  allFields: Field[]
): Field | null {
  const currentIndex = allFields.findIndex((f) => f.id === currentField.id)
  if (currentIndex >= 0 && currentIndex < allFields.length - 1) {
    return allFields[currentIndex + 1]
  }
  return null
}

/**
 * Find field by ID or ref
 */
function findFieldById(idOrRef: string, allFields: Field[]): Field | null {
  return (
    allFields.find((f) => f.id === idOrRef || f.ref === idOrRef) || null
  )
}

/**
 * Evaluate a logic condition
 */
export function evaluateCondition(
  condition: LogicCondition,
  answers: ResponseAnswers,
  currentField?: Field
): boolean {
  const { op, vars } = condition

  // Handle combiners (and/or) - vars array contains nested conditions
  if (op === 'and') {
    // For 'and', all nested conditions must be true
    return vars.every((varItem: any) => {
      if (varItem && typeof varItem === 'object' && 'op' in varItem) {
        return evaluateCondition(varItem as LogicCondition, answers, currentField)
      }
      // If it's a simple var, evaluate it
      return evaluateVarCondition(varItem, answers)
    })
  }

  if (op === 'or') {
    // For 'or', at least one nested condition must be true
    return vars.some((varItem: any) => {
      if (varItem && typeof varItem === 'object' && 'op' in varItem) {
        return evaluateCondition(varItem as LogicCondition, answers, currentField)
      }
      // If it's a simple var, evaluate it
      return evaluateVarCondition(varItem, answers)
    })
  }

  // Handle operators
  if (op === 'always') {
    return true
  }

  // Get field and choice values from vars
  const fieldVar = vars.find((v: any) => v.type === 'field')
  const choiceVar = vars.find((v: any) => v.type === 'choice')

  if (!fieldVar) return false

  const fieldRef = fieldVar.value
  const answer = answers[fieldRef]

  if (choiceVar) {
    const choiceValue = choiceVar.value
    return evaluateChoiceCondition(op, answer, choiceValue)
  }

  // Evaluate field value condition
  return evaluateFieldCondition(op, answer)
}

/**
 * Evaluate a single var condition (helper for nested conditions)
 */
function evaluateVarCondition(varItem: any, answers: ResponseAnswers): boolean {
  if (!varItem || typeof varItem !== 'object') return false
  
  // This handles nested conditions in and/or operations
  if ('op' in varItem) {
    return evaluateCondition(varItem as LogicCondition, answers)
  }
  
  return false
}

/**
 * Evaluate choice-based condition (for multiple choice questions)
 */
function evaluateChoiceCondition(
  op: string,
  answer: any,
  choiceValue: string
): boolean {
  if (answer === undefined || answer === null) return false

  // Handle array answers (multiple selection)
  const answerArray = Array.isArray(answer) ? answer : [answer]
  const answerStrings = answerArray.map((a) => String(a))

  switch (op) {
    case 'is':
      return answerStrings.includes(choiceValue)
    case 'is_not':
      return !answerStrings.includes(choiceValue)
    default:
      return false
  }
}

/**
 * Evaluate field value condition
 */
function evaluateFieldCondition(op: string, answer: any): boolean {
  if (answer === undefined || answer === null) {
    return op === 'is_not' // is_not with null/undefined is true
  }

  switch (op) {
    case 'is':
      return answer !== null && answer !== undefined
    case 'is_not':
      return answer === null || answer === undefined
    case 'contains':
      return String(answer).includes(String(answer))
    case 'not_contains':
      return !String(answer).includes(String(answer))
    default:
      return false
  }
}
