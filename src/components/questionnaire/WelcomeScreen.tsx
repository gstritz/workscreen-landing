'use client'

import { WelcomeScreen, ResponseAnswers, Field } from '@/types/questionnaire'
import { replaceFieldReferences } from '@/lib/questionnaire/parser'

interface WelcomeScreenProps {
  screen: WelcomeScreen
  answers: ResponseAnswers
  onNext: () => void
  onBack?: () => void
  welcomeScreens?: WelcomeScreen[]
  introStatementFields?: Field[]
}

export default function WelcomeScreenComponent({
  screen,
  answers,
  onNext,
  onBack,
  welcomeScreens = [],
  introStatementFields = [],
}: WelcomeScreenProps) {
  const buttonText = screen.properties?.button_text || 'Continue'

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

  // Combine all intro content
  const allIntroContent = [...welcomeContent, ...statementContent]

  return (
    <div className="card-premium p-10 sm:p-12 lg:p-16 animate-fade-in-up">
      <div className="max-w-2xl mx-auto">
        {/* Show all combined intro content */}
        {allIntroContent.length > 0 && (
          <div className="mb-12 space-y-4 text-left">
            {allIntroContent.map((content, index) => (
              <p key={index} className="text-base sm:text-lg text-gray-700 leading-relaxed">
                {content}
              </p>
            ))}
          </div>
        )}

        {screen.properties?.show_button !== false && (
          <div className="flex justify-center animate-fade-in-up">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onNext()
              }}
              className="button-primary min-w-[140px] text-lg px-10 py-5 flex items-center justify-center gap-2 group"
            >
              {buttonText}
              <svg className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
