'use client'

import { useState, useEffect, useCallback } from 'react'
import { Field, ResponseAnswers } from '@/types/questionnaire'
import { replaceFieldReferences } from '@/lib/questionnaire/parser'
import { getFieldValidationError } from '@/lib/questionnaire/validation'

interface ChatInputProps {
  field: Field | null
  answers: ResponseAnswers
  onAnswer: (fieldRef: string, value: any) => void
  onNext: (answerValue?: any) => void
  isSubmitting: boolean
}

export default function ChatInput({
  field,
  answers,
  onAnswer,
  onNext,
  isSubmitting,
}: ChatInputProps) {
  const [localValue, setLocalValue] = useState<any>('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isAdvancing, setIsAdvancing] = useState(false)

  // Reset local value when field changes
  useEffect(() => {
    setIsAdvancing(false) // Reset advancing state when field changes
    if (!field) {
      setLocalValue('')
      setValidationError(null)
      return
    }

    const fieldAnswer = answers[field.ref] || answers[field.id]
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
    setValidationError(null)
  }, [field?.id, field?.ref, answers])

  const handleChange = (value: any) => {
    setLocalValue(value)
    
    // Validate immediately for text inputs
    if (field && (field.type === 'short_text' || field.type === 'email' || field.type === 'phone_number' || field.type === 'long_text')) {
      const error = getFieldValidationError(field.type, value, field.ref, field.title)
      setValidationError(error)
    } else {
      setValidationError(null)
    }

    // Auto-advance for choice-based fields (single selection only)
    const isChoiceField = field && (field.type === 'multiple_choice' || field.type === 'yes_no')
    const isMultipleSelection = field?.type === 'multiple_choice' && field?.properties?.allow_multiple_selection
    
    // For single-selection choice fields, auto-advance after selection
    if (isChoiceField && !isMultipleSelection && value !== undefined && value !== null && value !== '' && 
        !(Array.isArray(value) && value.length === 0)) {
      setIsAdvancing(true) // Hide input immediately
      onAnswer(field.ref, value)
      // Small delay to show the answer bubble, then auto-advance
      setTimeout(() => {
        onNext(value) // Pass the answer value directly
      }, 800)
    }
  }

  const handleSubmit = useCallback(() => {
    if (!field || isSubmitting) return

    // Statement fields don't need answers - just advance
    if (field.type === 'statement') {
      onNext()
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

    // Validate field format
    if (hasValue) {
      const error = getFieldValidationError(field.type, localValue, field.ref, field.title)
      if (error) {
        setValidationError(error)
        return // Don't proceed if validation fails
      }
    }

    // Submit answer and move to next
    onAnswer(field.ref, localValue)
    onNext(localValue) // Pass the answer value directly
  }, [field, localValue, isSubmitting, onAnswer, onNext])

  // Handle Enter key for text inputs
  useEffect(() => {
    if (!field) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const target = e.target as HTMLElement
        if (target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
          return
        }

        const isRequired = field.validations?.required !== false
        const hasValue = localValue !== undefined && 
                         localValue !== null && 
                         localValue !== '' &&
                         !(Array.isArray(localValue) && localValue.length === 0)
        const error = hasValue 
          ? getFieldValidationError(field.type, localValue, field.ref, field.title)
          : null
        
        const isDisabled = isSubmitting || (isRequired && !hasValue) || !!error
        
        if (!isDisabled && field.type !== 'statement') {
          e.preventDefault()
          handleSubmit()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [field, localValue, isSubmitting, handleSubmit])

  // Statement fields auto-advance without showing input
  useEffect(() => {
    if (field && field.type === 'statement') {
      const timer = setTimeout(() => {
        onNext()
      }, 1000) // Show statement for 1 second then advance
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field?.id, field?.type])

  if (!field) {
    return null
  }

  // Don't show input for statement fields, choice fields (they're inline), or when advancing
  const isChoiceField = field.type === 'multiple_choice' || field.type === 'yes_no'
  if (field.type === 'statement' || isChoiceField || isAdvancing) {
    return null
  }

  const title = replaceFieldReferences(field.title || '', answers)
  const isRequired = field.validations?.required !== false
  const hasValue = localValue !== undefined && 
                   localValue !== null && 
                   localValue !== '' &&
                   !(Array.isArray(localValue) && localValue.length === 0)
  const isDisabled = isSubmitting || (isRequired && !hasValue) || !!validationError

  return (
    <div className="chat-input-container">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="glass rounded-2xl p-4 sm:p-6">
          {/* Show question title for multiple choice/yes_no in input area as well for clarity */}
          {(field.type === 'multiple_choice' || field.type === 'yes_no') && (
            <div className="mb-4 pb-4 border-b border-white/30">
              <h3 className="text-lg font-semibold text-gray-900">
                {replaceFieldReferences(field.title || '', answers)}
              </h3>
              {field.properties?.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {replaceFieldReferences(field.properties.description, answers)}
                </p>
              )}
            </div>
          )}

          {/* Validation error */}
          {validationError && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl animate-fade-in">
              <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 text-sm font-medium">{validationError}</p>
            </div>
          )}

          {/* Input based on field type */}
          <div className="mb-4">
            {renderFieldByType(field, localValue, handleChange, validationError)}
          </div>

          {/* Submit button for text inputs */}
          {(field.type === 'short_text' || field.type === 'email' || field.type === 'phone_number' || 
            field.type === 'long_text' || field.type === 'number' || field.type === 'date' || 
            field.type === 'dropdown' || field.type === 'file_upload') && (
            <button
              onClick={handleSubmit}
              disabled={isDisabled}
              className="w-full button-glass flex items-center justify-center gap-2 group"
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
                  {field.properties?.button_text || 'Send'}
                  <svg className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

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
      const titleLower = (field.title || '').toLowerCase()
      const refLower = (field.ref || '').toLowerCase()
      const isPhoneField = 
        field.type === 'phone_number' ||
        titleLower.includes('phone') ||
        refLower.includes('phone')
      
      return (
        <input
          type={field.type === 'email' ? 'email' : isPhoneField ? 'tel' : 'text'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`input-glass ${validationError ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : ''}`}
          placeholder={isPhoneField ? "Enter your phone number..." : "Type your answer here..."}
          required={field.validations?.required !== false}
        />
      )

    case 'long_text':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className={`input-glass resize-none ${validationError ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : ''}`}
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
          className={`input-glass ${validationError ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : ''}`}
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
          className={`input-glass ${validationError ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : ''}`}
          required={field.validations?.required !== false}
        />
      )

    case 'multiple_choice':
      return renderMultipleChoice(field, value, onChange)

    case 'yes_no':
      return renderYesNo(field, value, onChange)

    case 'dropdown':
      return renderDropdown(field, value, onChange, validationError)

    case 'file_upload':
      return (
        <div className={`glass border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          validationError 
            ? 'border-red-400/50 bg-red-50/50' 
            : 'border-white/40 hover:border-indigo-400/50 hover:shadow-lg'
        }`}>
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
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
            <svg className="w-12 h-12 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <span className="text-indigo-600 font-semibold group-hover:text-indigo-700 transition-colors">
                Click to upload
              </span>
              <span className="text-gray-500"> or drag and drop</span>
            </div>
            <p className="text-sm text-gray-400">PDF, DOC, DOCX up to 10MB</p>
          </label>
        </div>
      )

    case 'statement':
      return (
        <div className="text-gray-600">
          {field.properties?.description || ''}
        </div>
      )

    default:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`input-glass ${validationError ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : ''}`}
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
    const selectedValues = Array.isArray(value) ? value : value ? [value] : []

    return (
      <div className={`space-y-3 ${isVertical ? '' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'}`}>
        {choices.map((choice, index) => {
          const isSelected = selectedValues.includes(choice.id) || selectedValues.includes(choice.ref)
          return (
            <label
              key={choice.id}
              className={`group relative flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 animate-chat-bubble-in ${
                isSelected
                  ? 'glass border-2 border-indigo-500/50 shadow-lg scale-[1.02] bg-gradient-to-br from-indigo-50/80 to-purple-50/80'
                  : 'glass border-2 border-white/30 hover:border-indigo-300/50 hover:shadow-md hover:scale-[1.01]'
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
                className="sr-only"
              />
              <div className={`flex items-center justify-center w-6 h-6 rounded-lg mr-4 transition-all ${
                isSelected 
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-500' 
                  : 'bg-white/50 border-2 border-gray-300 group-hover:border-indigo-400'
              }`}>
                {isSelected && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-base font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                {choice.label}
              </span>
            </label>
          )
        })}
      </div>
    )
  } else {
    return (
      <div className={`space-y-3 ${isVertical ? '' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'}`}>
        {choices.map((choice, index) => {
          const isSelected = value === choice.id || value === choice.ref
          return (
            <label
              key={choice.id}
              className={`group relative flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 animate-chat-bubble-in ${
                isSelected
                  ? 'glass border-2 border-indigo-500/50 shadow-lg scale-[1.02] bg-gradient-to-br from-indigo-50/80 to-purple-50/80'
                  : 'glass border-2 border-white/30 hover:border-indigo-300/50 hover:shadow-md hover:scale-[1.01]'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <input
                type="radio"
                name={field.id}
                value={choice.id}
                checked={isSelected}
                onChange={() => onChange(choice.id)}
                className="sr-only"
              />
              <div className={`flex items-center justify-center w-6 h-6 rounded-full mr-4 transition-all ${
                isSelected 
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-500 ring-4 ring-indigo-200/50' 
                  : 'bg-white/50 border-2 border-gray-300 group-hover:border-indigo-400'
              }`}>
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                )}
              </div>
              <span className={`text-base font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
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
        className={`flex-1 px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
          value === true
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xl scale-105 ring-4 ring-indigo-200/50'
            : 'glass border-2 border-white/30 text-gray-700 hover:border-indigo-300/50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex-1 px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
          value === false
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xl scale-105 ring-4 ring-indigo-200/50'
            : 'glass border-2 border-white/30 text-gray-700 hover:border-indigo-300/50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
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
      className={`input-glass ${validationError ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : ''}`}
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
