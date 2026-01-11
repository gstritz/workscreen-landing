'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { QuestionnaireConfig, Field, WelcomeScreen, ThankYouScreen, ResponseAnswers } from '@/types/questionnaire'
import { getNextQuestion } from '@/lib/questionnaire/logic'
import BrandedHeader from './BrandedHeader'
import TypingIndicator from './TypingIndicator'
import ChatMessage from './ChatMessage'
import ChatContainer from './ChatContainer'
import ChatInput from './ChatInput'

interface Questionnaire {
  id: string
  subdomain: string
  title: string
  description?: string
  config: QuestionnaireConfig
  lawFirmEmail: string
  lawFirmName: string
  branding?: {
    logoUrl?: string
    primaryColor?: string
    secondaryColor?: string
    favicon?: string
    firmName?: string
  }
  isActive: boolean
}

type MessageType = 'question' | 'answer' | 'welcome' | 'thankyou'

interface Message {
  id: string
  type: MessageType
  field?: Field
  answer?: any
  screen?: WelcomeScreen | ThankYouScreen
  timestamp: number
}

export default function QuestionnaireRenderer({ questionnaire }: { questionnaire: Questionnaire }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentField, setCurrentField] = useState<Field | null>(null)
  const [answers, setAnswers] = useState<ResponseAnswers>({})
  const [responseId, setResponseId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)

  const config = questionnaire?.config || {}
  const allFields = useMemo(() => config?.fields || [], [config?.fields])
  const welcomeScreens = useMemo(() => config?.welcome_screens || [], [config?.welcome_screens])
  const thankYouScreens = useMemo(() => config?.thankyou_screens || [], [config?.thankyou_screens])
  const logic = useMemo(() => config?.logic || [], [config?.logic])
  
  // Find statement fields that come before the first input question (for intro display)
  const firstInputIndex = useMemo(() => {
    return allFields.findIndex(f => f.type !== 'statement')
  }, [allFields])
  
  const introStatementFields = useMemo(() => {
    return firstInputIndex > 0 
      ? allFields.slice(0, firstInputIndex).filter(f => f.type === 'statement')
      : []
  }, [allFields, firstInputIndex])
  
  // Remove statement fields that come before the first input - they're shown in intro, not as separate questions
  const fields = useMemo(() => {
    return firstInputIndex >= 0 && firstInputIndex < allFields.length
      ? allFields.slice(firstInputIndex) // Start from first input field
      : allFields.filter(f => f.type !== 'statement') // If no input found, filter all statements
  }, [allFields, firstInputIndex])

  // Initialize response session
  useEffect(() => {
    async function initializeResponse() {
      try {
        const response = await fetch('/api/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionnaireId: questionnaire.id }),
        })

        if (!response.ok) {
          console.error('Failed to create response session')
          return
        }

        const data = await response.json()
        setResponseId(data.responseId)

        const initialMessages: Message[] = []

        // Add welcome message
        if (welcomeScreens.length > 0 || introStatementFields.length > 0) {
          initialMessages.push({
            id: 'welcome-0',
            type: 'welcome',
            timestamp: Date.now()
          })
        }

        // Add first question
        if (fields.length > 0) {
          initialMessages.push({
            id: `question-${fields[0].id}-${Date.now()}`,
            type: 'question',
            field: fields[0],
            timestamp: Date.now()
          })
          setCurrentField(fields[0])
        }

        setMessages(initialMessages)
        setIsInitialized(true)
      } catch (error) {
        console.error('Error initializing response:', error)
      }
    }

    if (!isInitialized) {
      initializeResponse()
    }
  }, [questionnaire.id, welcomeScreens, introStatementFields, fields, isInitialized])

  // Auto-save answers periodically
  useEffect(() => {
    if (!responseId || Object.keys(answers).length === 0) return

    const autoSaveTimer = setTimeout(async () => {
      try {
        await fetch(`/api/responses/${responseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers }),
        })
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer)
  }, [answers, responseId])

  const handleAnswer = useCallback(
    (fieldRef: string, value: any) => {
      setAnswers((prev) => ({
        ...prev,
        [fieldRef]: value,
      }))
    },
    []
  )

  const handleNext = useCallback((answerValue?: any, fieldOverride?: Field) => {
    const fieldToUse = fieldOverride || currentField
    if (!fieldToUse) return

    // Add answer to messages if we have one
    const fieldAnswer = answerValue !== undefined 
      ? answerValue 
      : (answers[fieldToUse.ref] || answers[fieldToUse.id])
    
    if (fieldAnswer !== undefined && fieldAnswer !== null && fieldAnswer !== '' &&
        !(Array.isArray(fieldAnswer) && fieldAnswer.length === 0)) {
      setMessages((prev) => [
        ...prev,
        {
          id: `answer-${fieldToUse.id}-${Date.now()}`,
          type: 'answer',
          field: fieldToUse,
          answer: fieldAnswer,
          timestamp: Date.now()
        }
      ])
    }

    // Show typing indicator
    setIsTyping(true)

    // Get next question after a short delay
    setTimeout(() => {
      setIsTyping(false)

      // Use updated answers (including the one we just added) for logic
      const updatedAnswers = answerValue !== undefined
        ? { ...answers, [fieldToUse.ref]: answerValue }
        : answers

      // Use logic engine to determine next question
      const nextField = getNextQuestion(
        fieldToUse,
        updatedAnswers,
        fields,
        logic
      )

      if (nextField) {
        // Add question to messages first - use functional update to ensure it's added
        setMessages((prev) => {
          // Check if question already exists to avoid duplicates
          const questionExists = prev.some(m => 
            m.type === 'question' && m.field?.id === nextField.id
          )
          if (questionExists) {
            return prev
          }
          return [
            ...prev,
            {
              id: `question-${nextField.id}-${Date.now()}`,
              type: 'question',
              field: nextField,
              timestamp: Date.now()
            }
          ]
        })
        // Set current field after a delay to ensure question bubble renders first
        setTimeout(() => {
          setCurrentField(nextField)
        }, 400)
      } else {
        // No more questions, submit and show thank you screen
        handleSubmit()
        return
      }
    }, 600)
  }, [currentField, answers, fields, logic])

  const handleSubmit = useCallback(async () => {
    if (!responseId || isSubmitting) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/responses/${responseId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit')
      }

      // Show thank you screen as full screen
      if (thankYouScreens.length > 0) {
        setShowThankYou(true)
      }
      setCurrentField(null)
    } catch (error) {
      console.error('Error submitting response:', error)
      alert('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [responseId, answers, thankYouScreens, isSubmitting])

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-mesh">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading questionnaire...</p>
        </div>
      </div>
    )
  }

  // Show full-screen thank you screen
  if (showThankYou && thankYouScreens.length > 0) {
    return (
      <div className="h-screen gradient-mesh flex items-center justify-center">
        <div className="w-full max-w-lg px-4">
          <ChatMessage
            type="thankyou"
            screen={thankYouScreens[0]}
            answers={answers}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen gradient-mesh flex flex-col overflow-hidden">
      <BrandedHeader questionnaire={questionnaire} />

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full min-h-0 overflow-hidden">
        <ChatContainer>
          {messages.map((message) => {
            // Don't render thankyou messages inline - they're shown full screen
            if (message.type === 'thankyou') {
              return null
            }
            
            const isCurrentQuestion = message.type === 'question' && 
                                     message.field?.id === currentField?.id
            return (
              <ChatMessage
                key={message.id}
                type={message.type}
                field={message.field}
                answer={message.answer}
                screen={message.screen}
                answers={answers}
                welcomeScreens={welcomeScreens}
                introStatementFields={introStatementFields}
                onChoiceSelect={(fieldRef, value) => {
                  // Update answer immediately
                  handleAnswer(fieldRef, value)
                  
                  // Auto-advance for single-selection choice fields
                  if (message.field && 
                      (message.field.type === 'multiple_choice' && !message.field.properties?.allow_multiple_selection) ||
                      message.field.type === 'yes_no') {
                    // Use handleNext with the message field to properly advance
                    setTimeout(() => {
                      handleNext(value, message.field!)
                    }, 800)
                  } else if (message.field?.type === 'multiple_choice' && message.field.properties?.allow_multiple_selection) {
                    // For multi-select, just update the answer but don't advance
                    // User can continue selecting or manually proceed
                  }
                }}
                isCurrentQuestion={isCurrentQuestion}
              />
            )
          })}

          {isTyping && <TypingIndicator />}
        </ChatContainer>

        <ChatInput
          field={currentField}
          answers={answers}
          onAnswer={handleAnswer}
          onNext={handleNext}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}
