'use client'

interface TypingIndicatorProps {
 isTyping: boolean
 userName?: string
}

export function TypingIndicator({ isTyping, userName }: TypingIndicatorProps) {
 if (!isTyping) return null

 return (
 <div className="flex items-center gap-2 px-4 py-2">
 <div className="flex gap-1">
 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
 </div>
 {userName && (
 <span className="text-xs text-gray-600">{userName} is typing...</span>
 )}
 </div>
 )
}