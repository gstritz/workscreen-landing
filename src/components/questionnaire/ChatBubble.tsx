'use client'

import { ReactNode } from 'react'

interface ChatBubbleProps {
  children: ReactNode
  className?: string
}

export default function ChatBubble({ children, className = '' }: ChatBubbleProps) {
  return (
    <div className={`flex justify-start animate-chat-bubble-in ${className}`}>
      <div className="max-w-[85%] sm:max-w-[75%]">
        <div className="glass-bubble px-6 py-5 rounded-3xl rounded-tl-sm shadow-lg">
          {children}
        </div>
      </div>
    </div>
  )
}
