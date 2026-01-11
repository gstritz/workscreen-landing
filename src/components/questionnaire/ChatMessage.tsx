'use client'

import { Field, WelcomeScreen, ThankYouScreen, ResponseAnswers } from '@/types/questionnaire'
import { replaceFieldReferences } from '@/lib/questionnaire/parser'
import ChatBubble from './ChatBubble'
import AnswerBubble from './AnswerBubble'

interface ChatMessageProps {
  type: 'question' | 'answer' | 'welcome' | 'thankyou'
  field?: Field
  answer?: any
  screen?: WelcomeScreen | ThankYouScreen
  answers?: ResponseAnswers
  welcomeScreens?: WelcomeScreen[]
  introStatementFields?: Field[]
  onChoiceSelect?: (fieldRef: string, value: any) => void
  isCurrentQuestion?: boolean
}

export default function ChatMessage({
  type,
  field,
  answer,
  screen,
  answers = {},
  welcomeScreens = [],
  introStatementFields = [],
  onChoiceSelect,
  isCurrentQuestion = false,
}: ChatMessageProps) {
  if (type === 'welcome') {
    // Combine all welcome screen content
    const welcomeContent = welcomeScreens.flatMap(ws => {
      const items: string[] = []
      const title = ws.title ? replaceFieldReferences(ws.title, answers).trim() : ''
      if (title) items.push(title)
      const desc = ws.properties?.description ? replaceFieldReferences(ws.properties.description, answers).trim() : ''
      if (desc) items.push(desc)
      return items
    }).filter(item => item.length > 0)

    // Combine all statement field content
    const statementContent = introStatementFields.flatMap(field => {
      const items: string[] = []
      const title = field.title ? replaceFieldReferences(field.title, answers).trim() : ''
      if (title) items.push(title)
      const desc = field.properties?.description ? replaceFieldReferences(field.properties.description, answers).trim() : ''
      if (desc) items.push(desc)
      return items
    }).filter(item => item.length > 0)

    const allIntroContent = [...welcomeContent, ...statementContent]

    return (
      <ChatBubble>
        <div>
          {allIntroContent.length > 0 ? (
            allIntroContent.map((content, index) => (
              <p key={index} className={`text-base font-normal text-gray-800 leading-relaxed ${index > 0 ? 'mt-2' : ''}`}>
                {content}
              </p>
            ))
          ) : (
            <p className="text-base font-normal text-gray-800 leading-relaxed">
              Welcome! Let's get started.
            </p>
          )}
        </div>
      </ChatBubble>
    )
  }

  if (type === 'question' && field) {
    const title = replaceFieldReferences(field.title || '', answers)
    const description = field.properties?.description
      ? replaceFieldReferences(field.properties.description, answers)
      : null

    const isChoiceField = field.type === 'multiple_choice' || field.type === 'yes_no'
    const currentAnswer = answers[field.ref] || answers[field.id]

    // If this is a choice field and current question, render with options
    if (isChoiceField && isCurrentQuestion && onChoiceSelect) {
      return (
        <>
          <ChatBubble>
            <div>
              <p className="text-base font-normal text-gray-900 leading-relaxed">
                {title}
              </p>
              {description && (
                <p className="text-base font-normal text-gray-600 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </ChatBubble>
          <div className="px-4 mt-4">
            {field.type === 'multiple_choice' ? (
              renderMultipleChoiceInline(field, currentAnswer, (value) => onChoiceSelect(field.ref, value))
            ) : (
              renderYesNoInline(field, currentAnswer, (value) => onChoiceSelect(field.ref, value))
            )}
          </div>
        </>
      )
    }
    
    // Regular question without options
    return (
      <ChatBubble>
        <div>
          <p className="text-base font-normal text-gray-900 leading-relaxed">
            {title}
          </p>
          {description && (
            <p className="text-base font-normal text-gray-600 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </ChatBubble>
    )
  }

  if (type === 'answer' && field && answer !== undefined) {
    const formattedAnswer = formatAnswerForDisplay(field, answer)
    return (
      <AnswerBubble>
        <p className="text-white font-medium text-base">
          {formattedAnswer}
        </p>
      </AnswerBubble>
    )
  }

  if (type === 'thankyou' && screen) {
    const title = replaceFieldReferences(screen.title || '', answers)
    
    return (
      <div className="flex justify-center w-full">
        <div className="glass-bubble px-6 py-5 rounded-3xl shadow-lg">
          <div className="space-y-6">
            {/* Animated success icon */}
            <div className="flex justify-center animate-scale-in">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400/30 to-emerald-400/30 animate-ping opacity-75"></div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl">
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 text-white checkmark-animated"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-base font-medium text-gray-900 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {title}
              </p>

              {screen.properties?.description && (
                <p className="text-base text-gray-700 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  {replaceFieldReferences(screen.properties.description, answers)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

function formatAnswerForDisplay(field: Field, answer: any): string {
  if (answer === null || answer === undefined || answer === '') {
    return '—'
  }

  if (field.type === 'multiple_choice') {
    const choices = field.properties?.choices || []
    if (Array.isArray(answer)) {
      return answer.map((val) => {
        const choice = choices.find((c) => c.id === val || c.ref === val)
        return choice?.label || val
      }).join(', ')
    } else {
      const choice = choices.find((c) => c.id === answer || c.ref === answer)
      return choice?.label || String(answer)
    }
  } else if (field.type === 'yes_no') {
    return answer === true ? 'Yes' : answer === false ? 'No' : '—'
  } else if (field.type === 'date') {
    return new Date(answer).toLocaleDateString()
  }
  return String(answer)
}

function renderMultipleChoiceInline(
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
          // Only mark as selected if explicitly in the selectedValues array
          const isSelected = Array.isArray(selectedValues) && 
                            selectedValues.length > 0 &&
                            (selectedValues.includes(choice.id) || selectedValues.includes(choice.ref))
          return (
            <label
              key={choice.id}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!isSelected) {
                  onChange([...selectedValues, choice.id])
                } else {
                  onChange(selectedValues.filter((v) => v !== choice.id && v !== choice.ref))
                }
              }}
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
                  e.preventDefault()
                  e.stopPropagation()
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
          // Only mark as selected if value is explicitly set and matches
          const isSelected = value !== undefined && 
                            value !== null && 
                            value !== '' &&
                            (value === choice.id || value === choice.ref)
          return (
            <label
              key={choice.id}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onChange(choice.id)
              }}
              className={`group relative flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 animate-chat-bubble-in ${
                isSelected
                  ? 'glass border-2 border-indigo-500/50 shadow-lg scale-[1.02] bg-gradient-to-br from-indigo-50/80 to-purple-50/80'
                  : 'glass border-2 border-white/30 hover:border-indigo-300/50 hover:shadow-md hover:scale-[1.01]'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <input
                type="radio"
                name={`${field.id}-${field.ref}`}
                value={choice.id}
                checked={isSelected}
                onChange={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onChange(choice.id)
                }}
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

function renderYesNoInline(field: Field, value: any, onChange: (value: any) => void) {
  return (
    <div className="flex gap-4">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onChange(true)
        }}
        className={`flex-1 px-8 py-5 rounded-2xl font-bold text-base transition-all duration-300 transform ${
          value === true
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xl scale-105 ring-4 ring-indigo-200/50'
            : 'glass border-2 border-white/30 text-gray-700 hover:border-indigo-300/50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onChange(false)
        }}
        className={`flex-1 px-8 py-5 rounded-2xl font-bold text-base transition-all duration-300 transform ${
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
