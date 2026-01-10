'use client'

import { Field, ResponseAnswers } from '@/types/questionnaire'
import { QuestionnaireConfig } from '@/types/questionnaire'

interface ConfirmationScreenProps {
  answers: ResponseAnswers
  fields: Field[]
  config: QuestionnaireConfig
  onConfirm: () => void
  onBack: () => void
  isSubmitting: boolean
}

export default function ConfirmationScreen({
  answers,
  fields,
  config,
  onConfirm,
  onBack,
  isSubmitting,
}: ConfirmationScreenProps) {
  // Get all answered fields
  const answeredFields = fields.filter((field) => {
    const answer = answers[field.ref] || answers[field.id]
    return answer !== undefined && answer !== null && answer !== ''
  })

  const formatAnswer = (field: Field, answer: any): string => {
    if (answer === null || answer === undefined || answer === '') {
      return '—'
    }

    switch (field.type) {
      case 'multiple_choice':
        const choices = field.properties?.choices || []
        if (Array.isArray(answer)) {
          return answer
            .map((val) => {
              const choice = choices.find((c) => c.id === val || c.ref === val)
              return choice?.label || val
            })
            .join(', ')
        } else {
          const choice = choices.find((c) => c.id === answer || c.ref === answer)
          return choice?.label || answer
        }
      case 'yes_no':
        return answer === true ? 'Yes' : answer === false ? 'No' : '—'
      case 'date':
        return new Date(answer).toLocaleDateString()
      case 'file_upload':
        return typeof answer === 'string' ? answer : 'File uploaded'
      default:
        return String(answer)
    }
  }

  const getFieldLabel = (field: Field): string => {
    return field.title || field.ref || 'Untitled Question'
  }

  return (
    <div className="card-premium p-8 sm:p-10 lg:p-12 animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          Review Your Answers
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Please review your answers before submitting. You can go back to make changes if needed.
        </p>
      </div>

      {/* Answers List */}
      <div className="mb-8 space-y-4">
        {answeredFields.length > 0 ? (
          answeredFields.map((field, index) => {
            const answer = answers[field.ref] || answers[field.id]
            return (
              <div
                key={field.id}
                className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-shrink-0 w-full sm:w-1/3">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      {getFieldLabel(field)}
                    </h3>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 text-sm sm:text-base whitespace-pre-wrap break-words">
                      {formatAnswer(field, answer)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
            <p className="text-yellow-800">No answers to review.</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="button-secondary flex-1 flex items-center justify-center gap-2 group"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Edit
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex-1 button-primary flex items-center justify-center gap-2 group"
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
              Submit Answers
              <svg className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
