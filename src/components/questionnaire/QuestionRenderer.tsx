'use client'

import { useState, useEffect, useCallback } from 'react'
import { Field, ResponseAnswers } from '@/types/questionnaire'
import { replaceFieldReferences } from '@/lib/questionnaire/parser'
import { getFieldValidationError } from '@/lib/questionnaire/validation'

interface QuestionRendererProps {
  field: Field
  answers: ResponseAnswers
  onAnswer: (fieldRef: string, value: any) => void
  onNext: () => void
  onBack?: () => void
  isLast: boolean
  onSubmit: () => void
  isSubmitting: boolean
}

export default function QuestionRenderer({
  field,
  answers,
  onAnswer,
  onNext,
  onBack,
  isLast,
  onSubmit,
  isSubmitting,
}: QuestionRendererProps) {
  // Get answer for current field only
  const getCurrentFieldAnswer = () => {
    return answers[field.ref] || answers[field.id]
  }
  
  const [localValue, setLocalValue] = useState<any>(() => getCurrentFieldAnswer())

  // Reset local value when field changes - clear it for new questions
  useEffect(() => {
    const fieldAnswer = getCurrentFieldAnswer()
    // Always reset - if there's an answer for this field, use it; otherwise clear
    if (fieldAnswer !== undefined && fieldAnswer !== null && fieldAnswer !== '') {
      setLocalValue(fieldAnswer)
    } else {
      // Clear based on field type
      if (field.type === 'yes_no') {
        setLocalValue(null)
      } else if (field.type === 'multiple_choice' && field.properties?.allow_multiple_selection) {
        setLocalValue([])
      } else {
        setLocalValue('')
      }
    }
  }, [field.id, field.ref]) // Reset when field changes

  const handleChange = (value: any) => {
    setLocalValue(value)
    onAnswer(field.ref, value)
  }

  const handleNext = useCallback(() => {
    // Statement fields don't need answers - they're just info screens
    if (field.type === 'statement') {
      if (isLast) {
        onSubmit()
      } else {
        onNext()
      }
      return
    }

    // Make all input fields required by default (unless explicitly set to false)
    const isRequired = field.validations?.required !== false
    
    // Check if field has a value
    const hasValue = localValue !== undefined && 
                     localValue !== null && 
                     localValue !== '' &&
                     !(Array.isArray(localValue) && localValue.length === 0)

    if (isRequired && !hasValue) {
      return // Don't proceed if required field is empty
    }

    // Validate field format (email, phone, name, etc.)
    if (hasValue) {
      const validationError = getFieldValidationError(field.type, localValue, field.ref, field.title)
      if (validationError) {
        return // Don't proceed if validation fails
      }
    }

    if (isLast) {
      onSubmit()
    } else {
      onNext()
    }
  }, [field, localValue, isLast, onSubmit, onNext])

  // Add Enter/Return keybinding
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger on Enter/Return, and not when typing in textarea
      if (e.key === 'Enter' && !e.shiftKey) {
        const target = e.target as HTMLElement
        // Don't trigger if user is in a textarea (unless it's a single-line input)
        if (target.tagName === 'TEXTAREA') {
          return
        }
        
        // Don't trigger if user is in a select dropdown
        if (target.tagName === 'SELECT') {
          return
        }

        // Check if button is enabled
        const isRequired = field.validations?.required !== false
        const hasValue = localValue !== undefined && 
                         localValue !== null && 
                         localValue !== '' &&
                         !(Array.isArray(localValue) && localValue.length === 0)
        const validationError = hasValue 
          ? getFieldValidationError(field.type, localValue, field.ref, field.title)
          : null
        
        const isDisabled = isSubmitting || (isRequired && !hasValue) || !!validationError
        
        if (!isDisabled && field.type !== 'statement') {
          e.preventDefault()
          handleNext()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [localValue, field, isSubmitting, handleNext])

  // Get validation error for current field (only show if field has a value)
  const validationError = localValue !== undefined && 
                          localValue !== null && 
                          localValue !== '' &&
                          !(Array.isArray(localValue) && localValue.length === 0)
    ? getFieldValidationError(field.type, localValue, field.ref, field.title)
    : null

  const title = replaceFieldReferences(field.title || '', answers)
  const description = field.properties?.description
    ? replaceFieldReferences(field.properties.description, answers)
    : null

  return (
    <div className="card-premium p-8 sm:p-10 lg:p-12 animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {title}
        </h2>
        {description && (
          <p className="text-lg text-gray-600 leading-relaxed">{description}</p>
        )}
      </div>

      {/* Render field based on type */}
      <div className="mb-8">
        {renderFieldByType(field, localValue, handleChange, validationError)}
      </div>

      {/* Validation error message */}
      {validationError && (
        <div className="mb-6 flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
          <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-red-700 text-sm font-medium">{validationError}</p>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
        {onBack && (
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="button-secondary flex-1 flex items-center justify-center gap-2 group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={(() => {
            // Statement fields are never disabled (they're just info screens)
            if (field.type === 'statement') {
              return isSubmitting
            }
            
            const isRequired = field.validations?.required !== false
            const hasValue = localValue !== undefined && 
                             localValue !== null && 
                             localValue !== '' &&
                             !(Array.isArray(localValue) && localValue.length === 0)
            
            // Disable if required and empty, or if there's a validation error
            return isSubmitting || (isRequired && !hasValue) || !!validationError
          })()}
          className={`${onBack ? 'flex-1' : 'w-full'} button-primary flex items-center justify-center gap-2 group`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            <>
              {isLast ? 'Submit' : field.properties?.button_text || 'Next'}
              <svg className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

/**
 * Render field input based on field type
 */
function renderFieldByType(
  field: Field,
  value: any,
  onChange: (value: any) => void,
  validationError: string | null = null
) {
  switch (field.type) {
    case 'short_text':
    case 'email':
    case 'phone_number':
      // Detect phone field by title or ref
      const titleLower = (field.title || '').toLowerCase()
      const refLower = (field.ref || '').toLowerCase()
      const isPhoneField = 
        field.type === 'phone_number' ||
        titleLower.includes('phone') ||
        refLower.includes('phone') ||
        refLower === 'a045cd11-7955-47cf-b030-914e5a96eba5'
      
      return (
        <input
          type={field.type === 'email' ? 'email' : isPhoneField ? 'tel' : 'text'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`input-premium ${validationError ? 'input-error' : ''}`}
          placeholder={isPhoneField ? "Enter your phone number..." : "Type your answer here..."}
          required={field.validations?.required !== false}
        />
      )

    case 'long_text':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className={`textarea-premium ${validationError ? 'input-error' : ''}`}
          placeholder="Type your answer here..."
          required={field.validations?.required !== false}
        />
      )

    case 'number':
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
          className={`input-premium ${validationError ? 'input-error' : ''}`}
          min={field.validations?.min}
          max={field.validations?.max}
          required={field.validations?.required !== false}
        />
      )

    case 'date':
      return (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`input-premium ${validationError ? 'input-error' : ''}`}
          required={field.validations?.required !== false}
        />
      )

    case 'multiple_choice':
      return renderMultipleChoice(field, value, onChange)

    case 'yes_no':
      return renderYesNo(field, value, onChange)

    case 'dropdown':
      return renderDropdown(field, value, onChange, validationError)

    case 'statement':
      return (
        <div className="text-gray-600">
          {field.properties?.description || ''}
        </div>
      )

    case 'file_upload':
      return (
        <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
          validationError 
            ? 'border-red-300 bg-red-50' 
            : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/50'
        }`}>
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                // TODO: Upload file and get URL
                onChange(file.name)
              }
            }}
            className="hidden"
            id={`file-${field.id}`}
          />
          <label
            htmlFor={`file-${field.id}`}
            className="cursor-pointer flex flex-col items-center gap-3 group"
          >
            <svg className="w-12 h-12 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <span className="text-primary-600 font-semibold group-hover:text-primary-700 transition-colors">
                Click to upload
              </span>
              <span className="text-gray-500"> or drag and drop</span>
            </div>
            <p className="text-sm text-gray-400">PDF, DOC, DOCX up to 10MB</p>
          </label>
        </div>
      )

    default:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`input-premium ${validationError ? 'input-error' : ''}`}
        />
      )
  }
}

function renderMultipleChoice(
  field: Field,
  value: any,
  onChange: (value: any) => void
) {
  const choices = field.properties?.choices || []
  const allowMultiple = field.properties?.allow_multiple_selection
  const isVertical = field.properties?.vertical_alignment !== false

  if (allowMultiple) {
    // Checkboxes
    const selectedValues = Array.isArray(value) ? value : value ? [value] : []

    return (
      <div className={`space-y-3 ${isVertical ? '' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'}`}>
        {choices.map((choice, index) => {
          const isSelected = selectedValues.includes(choice.id) || selectedValues.includes(choice.ref)
          return (
            <label
              key={choice.id}
              className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 animate-fade-in-up ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-md scale-[1.02]'
                  : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50/30 hover:shadow-sm'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...selectedValues, choice.id])
                  } else {
                    onChange(selectedValues.filter((v) => v !== choice.id && v !== choice.ref))
                  }
                }}
                className="mr-4 h-5 w-5 text-primary-600 rounded border-gray-300 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all"
              />
              <span className={`font-medium ${isSelected ? 'text-primary-900' : 'text-gray-700'}`}>
                {choice.label}
              </span>
            </label>
          )
        })}
      </div>
    )
  } else {
    // Radio buttons
    return (
      <div className={`space-y-3 ${isVertical ? '' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'}`}>
        {choices.map((choice, index) => {
          const isSelected = value === choice.id || value === choice.ref
          return (
            <label
              key={choice.id}
              className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 animate-fade-in-up ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-md scale-[1.02]'
                  : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50/30 hover:shadow-sm'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <input
                type="radio"
                name={field.id}
                value={choice.id}
                checked={isSelected}
                onChange={() => onChange(choice.id)}
                className="mr-4 h-5 w-5 text-primary-600 border-gray-300 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all"
              />
              <span className={`font-medium ${isSelected ? 'text-primary-900' : 'text-gray-700'}`}>
                {choice.label}
              </span>
            </label>
          )
        })}
      </div>
    )
  }
}

function renderYesNo(field: Field, value: any, onChange: (value: any) => void) {
  return (
    <div className="flex gap-4">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex-1 px-8 py-5 rounded-xl font-semibold text-lg transition-all duration-200 transform ${
          value === true
            ? 'bg-primary-600 text-white shadow-lg scale-105'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex-1 px-8 py-5 rounded-xl font-semibold text-lg transition-all duration-200 transform ${
          value === false
            ? 'bg-primary-600 text-white shadow-lg scale-105'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        No
      </button>
    </div>
  )
}

function renderDropdown(
  field: Field,
  value: any,
  onChange: (value: any) => void,
  validationError: string | null = null
) {
  const choices = field.properties?.choices || []

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={`select-premium ${validationError ? 'input-error' : ''}`}
      required={field.validations?.required !== false}
    >
      <option value="">Select an option...</option>
      {choices.map((choice) => (
        <option key={choice.id} value={choice.id}>
          {choice.label}
        </option>
      ))}
    </select>
  )
}
