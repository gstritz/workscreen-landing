'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface ChatContainerProps {
  children: ReactNode
}

export default function ChatContainer({ children }: ChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when content changes
  useEffect(() => {
    if (containerRef.current) {
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: 'smooth'
          })
        }
      }, 100)
    }
  }, [children])

  return (
    <div
      ref={containerRef}
      className="chat-container px-4 py-6 space-y-3 scroll-smooth"
      style={{ scrollbarWidth: 'thin' }}
    >
      {children}
    </div>
  )
}
