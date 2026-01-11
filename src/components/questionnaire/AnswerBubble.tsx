'use client'

import { ReactNode } from 'react'

interface AnswerBubbleProps {
  children: ReactNode
  className?: string
  delay?: number
}

export default function AnswerBubble({ children, className = '', delay = 0 }: AnswerBubbleProps) {
  return (
    <div
      className={`flex justify-end animate-answer-bubble-in ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="max-w-[85%] sm:max-w-[75%]">
        <div className="answer-bubble px-6 py-5 rounded-3xl rounded-tr-sm shadow-lg">
          {children}
        </div>
      </div>
    </div>
  )
}
