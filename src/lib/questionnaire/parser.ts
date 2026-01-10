/**
 * Flexible parser for Typeform JSON structure
 * Handles variations and customizations per law firm
 */

import {
  QuestionnaireConfig,
  Field,
  WelcomeScreen,
  ThankYouScreen,
  Logic,
  FieldType,
} from '@/types/questionnaire'

// Typeform JSON structure (flexible - allows for variations)
interface TypeformJSON {
  id?: string
  title: string
  type?: string
  fields: any[]
  welcome_screens?: any[]
  thankyou_screens?: any[]
  logic?: any[]
  settings?: any
  [key: string]: any // Allow additional properties
}

/**
 * Parse Typeform JSON into our internal questionnaire format
 * This parser is flexible and handles variations in structure
 */
export function parseTypeformJSON(json: TypeformJSON): QuestionnaireConfig {
  const config: QuestionnaireConfig = {
    title: json.title || 'Untitled Questionnaire',
    description: json.description,
    language: json.settings?.language || 'en',
    fields: parseFields(json.fields || []),
    welcome_screens: parseWelcomeScreens(json.welcome_screens || []),
    thankyou_screens: parseThankYouScreens(json.thankyou_screens || []),
    logic: parseLogic(json.logic || []),
    settings: json.settings || {},
  }

  // Preserve any additional custom properties
  Object.keys(json).forEach((key) => {
    if (!['id', 'title', 'fields', 'welcome_screens', 'thankyou_screens', 'logic', 'settings', 'description'].includes(key)) {
      config[key] = json[key]
    }
  })

  return config
}

/**
 * Parse fields array - handles various field types flexibly
 */
function parseFields(fields: any[]): Field[] {
  return fields.map((field) => {
    const parsed: Field = {
      id: field.id || generateId(),
      ref: field.ref || field.id || generateId(),
      title: field.title || '',
      type: normalizeFieldType(field.type),
      properties: parseFieldProperties(field.properties || {}, field.type),
      validations: parseFieldValidations(field.validations || {}),
    }

    return parsed
  })
}

/**
 * Normalize field type - handles variations in naming
 */
function normalizeFieldType(type: string): FieldType {
  const typeMap: Record<string, FieldType> = {
    short_text: 'short_text',
    long_text: 'long_text',
    email: 'email',
    number: 'number',
    phone_number: 'phone_number',
    date: 'date',
    multiple_choice: 'multiple_choice',
    yes_no: 'yes_no',
    dropdown: 'dropdown',
    statement: 'statement',
    file_upload: 'file_upload',
    rating: 'rating',
    opinion_scale: 'opinion_scale',
    picture_choice: 'picture_choice',
  }

  return typeMap[type] || 'short_text'
}

/**
 * Parse field properties - flexible handling of different property structures
 */
function parseFieldProperties(properties: any, fieldType: string): any {
  const parsed: any = {}

  // Common properties
  if (properties.description !== undefined) parsed.description = properties.description
  if (properties.button_text !== undefined) parsed.button_text = properties.button_text
  if (properties.hide_marks !== undefined) parsed.hide_marks = properties.hide_marks

  // Multiple choice specific
  if (fieldType === 'multiple_choice' || fieldType === 'dropdown' || fieldType === 'picture_choice') {
    if (properties.randomize !== undefined) parsed.randomize = properties.randomize
    if (properties.allow_multiple_selection !== undefined)
      parsed.allow_multiple_selection = properties.allow_multiple_selection
    if (properties.allow_other_choice !== undefined)
      parsed.allow_other_choice = properties.allow_other_choice
    if (properties.vertical_alignment !== undefined)
      parsed.vertical_alignment = properties.vertical_alignment
    if (properties.choices) {
      parsed.choices = properties.choices.map((choice: any) => ({
        id: choice.id || generateId(),
        ref: choice.ref || choice.id,
        label: choice.label || '',
      }))
    }
  }

  // Rating/scale specific
  if (fieldType === 'rating' || fieldType === 'opinion_scale') {
    if (properties.steps !== undefined) parsed.steps = properties.steps
    if (properties.start_at_one !== undefined) parsed.start_at_one = properties.start_at_one
    if (properties.labels) parsed.labels = properties.labels
  }

  // Preserve any additional custom properties
  Object.keys(properties).forEach((key) => {
    if (!parsed.hasOwnProperty(key)) {
      parsed[key] = properties[key]
    }
  })

  return parsed
}

/**
 * Parse field validations
 */
function parseFieldValidations(validations: any): any {
  const parsed: any = {}

  if (validations.required !== undefined) parsed.required = validations.required
  if (validations.maxLength !== undefined) parsed.maxLength = validations.maxLength
  if (validations.minLength !== undefined) parsed.minLength = validations.minLength
  if (validations.pattern !== undefined) parsed.pattern = validations.pattern
  if (validations.min !== undefined) parsed.min = validations.min
  if (validations.max !== undefined) parsed.max = validations.max

  // Preserve additional validation rules
  Object.keys(validations).forEach((key) => {
    if (!parsed.hasOwnProperty(key)) {
      parsed[key] = validations[key]
    }
  })

  return parsed
}

/**
 * Parse welcome screens
 */
function parseWelcomeScreens(screens: any[]): WelcomeScreen[] {
  return screens.map((screen) => ({
    id: screen.id || generateId(),
    ref: screen.ref || screen.id || generateId(),
    title: screen.title || '',
    properties: screen.properties || {},
  }))
}

/**
 * Parse thank you screens
 */
function parseThankYouScreens(screens: any[]): ThankYouScreen[] {
  return screens.map((screen) => ({
    id: screen.id || generateId(),
    ref: screen.ref || screen.id || generateId(),
    title: screen.title || '',
    properties: screen.properties || {},
  }))
}

/**
 * Parse logic rules - handles complex conditional logic
 */
function parseLogic(logic: any[]): Logic[] {
  return logic.map((rule) => ({
    type: rule.type || 'field',
    ref: rule.ref || rule.field?.ref || '',
    actions: (rule.actions || []).map((action: any) => ({
      action: action.action || 'jump',
      details: action.details || {},
      condition: action.condition || { op: 'always', vars: [] },
    })),
  }))
}

/**
 * Generate a simple ID (fallback if missing)
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * Replace field references in text (e.g., {{field:ref}})
 */
export function replaceFieldReferences(
  text: string,
  answers: Record<string, any>
): string {
  if (!text) return text

  // Match {{field:ref}} pattern
  const fieldRefPattern = /\{\{field:([^}]+)\}\}/g

  return text.replace(fieldRefPattern, (match, ref) => {
    const answer = answers[ref]
    return answer !== undefined && answer !== null ? String(answer) : match
  })
}
