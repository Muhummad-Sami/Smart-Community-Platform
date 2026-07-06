'use client'

import { useEffect, useRef } from 'react'
import { FaUser, FaComments, FaArrowLeft } from 'react-icons/fa'
import { Message } from '@/services/api/message'
import { MessageBubble } from '../MessageBubble'
import { ChatInput } from '../ChatInput'

interface ChatWindowProps {
 messages: Message[]
 selectedUser: {
 id: string
 fullName: string
 profilePicture?: string | null
 } | null
 isOnline: boolean
 isTyping: boolean
 onSendMessage: (message: string) => void
 onTyping: (isTyping: boolean) => void
 onBack?: () => void
 loading?: boolean
 currentUserId: string
}

export function ChatWindow({
 messages,
 selectedUser,
 isOnline,
 isTyping,
 onSendMessage,
 onTyping,
 onBack,
 loading,
 currentUserId,
}: ChatWindowProps) {
 const messagesEndRef = useRef<HTMLDivElement>(null)

 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
 }, [messages])

 if (!selectedUser) {
 return (
 <div className="flex-1 flex items-center justify-center text-center p-8">
 <div>
 <FaComments className="text-6xl text-gray-600 mx-auto mb-4" />
 <h3 className="text-xl font-semibold text-white">Select a conversation</h3>
 <p className="text-gray-600 mt-2">Choose a user to start messaging</p>
 </div>
 </div>
 )
 }

 return (
 <div className="flex flex-col h-full">
 {/* Chat Header */}
 <div className="p-4 border-b border-gray-200 flex items-center gap-3">
 {onBack && (
 <button
 onClick={onBack}
 className="md:hidden text-gray-600 hover:text-white transition-colors"
 >
 <FaArrowLeft />
 </button>
 )}
 <div className="relative flex-shrink-0">
 <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm">
 {selectedUser.fullName?.charAt(0) || 'U'}
 </div>
 {isOnline && (
 <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-dark"></div>
 )}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-white font-medium truncate">{selectedUser.fullName}</p>
 <p className="text-xs">
 {isOnline ? (
 <span className="text-green-500">🟢 Online</span>
 ) : (
 <span className="text-gray-600">⚪ Offline</span>
 )}
 </p>
 </div>
 </div>

 {/* Messages */}
 <div className="flex-1 overflow-y-auto p-4 space-y-2">
 {loading ? (
 <div className="flex justify-center py-8">
 <div className="spinner-sm"></div>
 </div>
 ) : messages.length === 0 ? (
 <div className="text-center text-gray-600 py-8">
 <p>No messages yet</p>
 <p className="text-sm mt-2">Say hello! 👋</p>
 </div>
 ) : (
 messages.map((msg) => (
 <MessageBubble
 key={msg.id || msg.tempId || Math.random().toString()} // ✅ Updated key
 message={msg}
 isOwn={msg.senderId === currentUserId}
 />
 ))
 )}
 
 {isTyping && (
 <div className="flex justify-start">
 <div className="glass p-3 rounded-xl">
 <div className="flex gap-1">
 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
 </div>
 </div>
 </div>
 )}
 <div ref={messagesEndRef} />
 </div>

 {/* Chat Input */}
 <div className="p-4 border-t border-gray-200">
 <ChatInput
 onSendMessage={onSendMessage}
 onTyping={onTyping}
 disabled={!selectedUser}
 />
 </div>
 </div>
 )
}