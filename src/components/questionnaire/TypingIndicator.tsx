'use client'

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-6 py-4 animate-fade-in">
      <div className="flex gap-1.5">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  )
}
