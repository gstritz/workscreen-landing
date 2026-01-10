'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { QuestionnaireConfig, Field, WelcomeScreen, ThankYouScreen, ResponseAnswers } from '@/types/questionnaire'
import WelcomeScreenComponent from './WelcomeScreen'
import ThankYouScreenComponent from './ThankYouScreen'
import QuestionRenderer from './QuestionRenderer'
import ConfirmationScreen from './ConfirmationScreen'
import { getNextQuestion } from '@/lib/questionnaire/logic'
import { replaceFieldReferences } from '@/lib/questionnaire/parser'
import BrandedHeader from './BrandedHeader'

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

type ScreenType = 'welcome' | 'question' | 'confirmation' | 'thankyou'

interface CurrentScreen {
  type: ScreenType
  data: WelcomeScreen | Field | ThankYouScreen | null
  index: number
}

export default function QuestionnaireRenderer({ questionnaire }: { questionnaire: Questionnaire }) {
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen | null>(null)
  const [answers, setAnswers] = useState<ResponseAnswers>({})
  const [responseId, setResponseId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [navigationHistory, setNavigationHistory] = useState<(Field | WelcomeScreen | ThankYouScreen)[]>([])

  const config = questionnaire?.config || {}
  const allFields = useMemo(() => config?.fields || [], [config?.fields])
  const welcomeScreens = useMemo(() => config?.welcome_screens || [], [config?.welcome_screens])
  const thankYouScreens = useMemo(() => config?.thankyou_screens || [], [config?.thankyou_screens])
  const logic = useMemo(() => config?.logic || [], [config?.logic])
  
  // Find statement fields that come before the first input question (for intro display)
  // Memoize firstInputIndex to ensure stable reference
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
        setSessionId(data.sessionId)

        // Start with intro screen if there's intro content, otherwise first question
        if (welcomeScreens.length > 0 || introStatementFields.length > 0) {
          // Create a combined intro screen
          const introScreen: WelcomeScreen = {
            id: 'intro-combined',
            ref: 'intro-combined',
            title: '',
            properties: {
              show_button: true,
              button_text: 'Continue',
              description: ''
            }
          }
          setCurrentScreen({
            type: 'welcome',
            data: introScreen,
            index: 0,
          })
          setNavigationHistory([introScreen])
        } else if (fields.length > 0) {
          const firstField = fields[0]
          setCurrentScreen({
            type: 'question',
            data: firstField,
            index: 0,
          })
          setNavigationHistory([firstField])
        }
      } catch (error) {
        console.error('Error initializing response:', error)
      }
    }

    initializeResponse()
  }, [questionnaire.id, welcomeScreens, fields, introStatementFields])

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

  // Calculate progress
  useEffect(() => {
    if (!currentScreen || currentScreen.type !== 'question') {
      setProgress(0)
      return
    }

    const currentIndex = fields.findIndex((f) => f.id === (currentScreen.data as Field)?.id)
    if (currentIndex >= 0) {
      const totalQuestions = fields.length
      setProgress(((currentIndex + 1) / totalQuestions) * 100)
    }
  }, [currentScreen, fields])

  const handleAnswer = useCallback(
    (fieldRef: string, value: any) => {
      setAnswers((prev) => ({
        ...prev,
        [fieldRef]: value,
      }))
    },
    []
  )

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

      // Show thank you screen
      if (thankYouScreens.length > 0) {
        const thankYouScreen = thankYouScreens[0]
        setCurrentScreen({
          type: 'thankyou',
          data: thankYouScreen,
          index: 0,
        })
        setNavigationHistory((prev) => [...prev, thankYouScreen])
      }
    } catch (error) {
      console.error('Error submitting response:', error)
      alert('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [responseId, answers, thankYouScreens, isSubmitting])

  const handleNext = useCallback(() => {
    if (!currentScreen) return

    if (currentScreen.type === 'welcome') {
      // Move to first question
      if (fields && fields.length > 0) {
        const firstField = fields[0]
        setCurrentScreen({
          type: 'question',
          data: firstField,
          index: 0,
        })
        setNavigationHistory((prev) => [...prev, firstField])
      } else {
        // If no fields, try to show thank you screen or submit
        if (thankYouScreens && thankYouScreens.length > 0) {
          const thankYouScreen = thankYouScreens[0]
          setCurrentScreen({
            type: 'thankyou',
            data: thankYouScreen,
            index: 0,
          })
          setNavigationHistory((prev) => [...prev, thankYouScreen])
        }
      }
      return
    }

    if (currentScreen.type === 'question') {
      const currentField = currentScreen.data as Field
      const currentIndex = fields.findIndex((f) => f.id === currentField.id)

      // Use logic engine to determine next question
      const nextField = getNextQuestion(
        currentField,
        answers,
        fields,
        logic
      )

      if (nextField) {
        const nextIndex = fields.findIndex((f) => f.id === nextField.id)
        setCurrentScreen({
          type: 'question',
          data: nextField,
          index: nextIndex,
        })
        setNavigationHistory((prev) => [...prev, nextField])
      } else {
        // No more questions, show thank you screen
        if (thankYouScreens.length > 0) {
          const thankYouScreen = thankYouScreens[0]
          setCurrentScreen({
            type: 'thankyou',
            data: thankYouScreen,
            index: 0,
          })
          setNavigationHistory((prev) => [...prev, thankYouScreen])
        } else {
          // Submit if no thank you screen
          handleSubmit()
        }
      }
    }
  }, [currentScreen, answers, fields, logic, thankYouScreens, handleSubmit])

  const handleBack = useCallback(() => {
    if (!currentScreen || navigationHistory.length <= 1) return

    // Remove current screen from history and go to previous
    const newHistory = [...navigationHistory]
    newHistory.pop() // Remove current
    const previousItem = newHistory[newHistory.length - 1]

    if (!previousItem) return

    // Determine type of previous item
    if (welcomeScreens.some((s) => s.id === previousItem.id || s.ref === (previousItem as any).ref)) {
      setCurrentScreen({
        type: 'welcome',
        data: previousItem as WelcomeScreen,
        index: 0,
      })
    } else if (thankYouScreens.some((s) => s.id === previousItem.id || s.ref === (previousItem as any).ref)) {
      setCurrentScreen({
        type: 'thankyou',
        data: previousItem as ThankYouScreen,
        index: 0,
      })
    } else {
      const previousField = previousItem as Field
      const previousIndex = fields.findIndex((f) => f.id === previousField.id)
      setCurrentScreen({
        type: 'question',
        data: previousField,
        index: previousIndex >= 0 ? previousIndex : 0,
      })
    }

    setNavigationHistory(newHistory)
  }, [currentScreen, navigationHistory, fields, welcomeScreens, thankYouScreens])

  if (!currentScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-mesh">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading questionnaire...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-mesh bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <BrandedHeader questionnaire={questionnaire} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Enhanced Progress bar */}
        {currentScreen.type === 'question' && config.settings?.show_progress_bar !== false && (
          <div className="mb-10 sm:mb-12 animate-fade-in-up">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner-premium">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse-slow"></div>
              </div>
            </div>
          </div>
        )}

        {/* Render current screen with smooth transitions */}
        <div className="animate-fade-in-up">
          {currentScreen.type === 'welcome' && (
            <WelcomeScreenComponent
              screen={currentScreen.data as WelcomeScreen}
              answers={answers}
              onNext={handleNext}
              onBack={undefined}
              welcomeScreens={welcomeScreens}
              introStatementFields={introStatementFields}
            />
          )}

          {currentScreen.type === 'question' && (
            <QuestionRenderer
              field={currentScreen.data as Field}
              answers={answers}
              onAnswer={handleAnswer}
              onNext={handleNext}
              onBack={(() => {
                // Never show back button on first question
                if (currentScreen.index === 0) {
                  return undefined
                }
                // Show back button if there's navigation history
                return navigationHistory.length > 1 ? handleBack : undefined
              })()}
              isLast={currentScreen.index === fields.length - 1}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}

          {currentScreen.type === 'confirmation' && (
            <ConfirmationScreen
              answers={answers}
              fields={fields}
              config={config}
              onConfirm={handleSubmit}
              onBack={() => {
                // Go back to last question
                if (navigationHistory.length > 0) {
                  const lastItem = navigationHistory[navigationHistory.length - 1]
                  if (lastItem && 'type' in lastItem) {
                    const lastField = lastItem as Field
                    const lastIndex = fields.findIndex((f) => f.id === lastField.id)
                    setCurrentScreen({
                      type: 'question',
                      data: lastField,
                      index: lastIndex >= 0 ? lastIndex : fields.length - 1,
                    })
                  }
                }
              }}
              isSubmitting={isSubmitting}
            />
          )}

          {currentScreen.type === 'thankyou' && (
            <ThankYouScreenComponent
              screen={currentScreen.data as ThankYouScreen}
              answers={answers}
              questionnaire={questionnaire}
            />
          )}
        </div>
      </div>
    </div>
  )
}
