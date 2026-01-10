'use client'

import { ThankYouScreen, ResponseAnswers } from '@/types/questionnaire'
import { replaceFieldReferences } from '@/lib/questionnaire/parser'

interface ThankYouScreenProps {
  screen: ThankYouScreen
  answers: ResponseAnswers
  questionnaire: {
    lawFirmName: string
    branding?: {
      logoUrl?: string
      primaryColor?: string
    }
  }
}

export default function ThankYouScreenComponent({
  screen,
  answers,
  questionnaire,
}: ThankYouScreenProps) {
  const title = replaceFieldReferences(screen.title || '', answers)
  const buttonText = screen.properties?.button_text || 'Submit Another'

  const handleButtonClick = () => {
    if (screen.properties?.button_mode === 'reload') {
      window.location.reload()
    } else if (screen.properties?.button_mode === 'redirect') {
      // Could redirect to a custom URL if specified
      window.location.href = '/'
    }
  }

  return (
    <div className="card-premium p-10 sm:p-12 lg:p-16 text-center animate-fade-in-up">
      <div className="max-w-2xl mx-auto">
        {/* Animated success icon */}
        <div className="mb-8 flex justify-center animate-scale-in">
          <div className="relative">
            {/* Outer circle with pulse animation */}
            <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-75"></div>
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-lg">
              <svg
                className="w-12 h-12 text-green-600 checkmark-animated"
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

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {title}
        </h1>

        {screen.properties?.description && (
          <p className="text-xl sm:text-2xl text-gray-600 mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {replaceFieldReferences(screen.properties.description, answers)}
          </p>
        )}

        {screen.properties?.show_button && (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={handleButtonClick}
              className="button-primary text-lg px-10 py-5 flex items-center justify-center gap-2 mx-auto group"
            >
              {buttonText}
              <svg className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Decorative elements */}
        <div className="mt-16 flex justify-center gap-2 opacity-20">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary-600 animate-float"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}
