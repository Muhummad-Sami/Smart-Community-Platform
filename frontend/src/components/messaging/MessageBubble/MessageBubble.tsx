'use client'

import { Message } from '@/services/api/message'

interface MessageBubbleProps {
 message: Message
 isOwn: boolean
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
 const isSending = message.status === 'sending'
 const isFailed = message.status === 'failed'

 return (
 <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
 <div
 className={`max-w-[70%] p-3 rounded-xl ${
 isOwn
 ? 'bg-teal-500 text-white'
 : 'glass text-white'
 } ${isFailed ? 'opacity-50' : ''}`}
 >
 <p className="break-words">{message.content}</p>
 <div className="flex items-center gap-1 mt-1 justify-end">
 <span className="text-[10px] opacity-70">
 {new Date(message.createdAt).toLocaleTimeString([], { 
 hour: '2-digit', 
 minute: '2-digit' 
 })}
 </span>
 {isOwn && (
 <span className="text-[10px] opacity-70">
 {isSending ? '⌛' : isFailed ? '⚠️' : '✓✓'}
 </span>
 )}
 </div>
 </div>
 </div>
 )
}