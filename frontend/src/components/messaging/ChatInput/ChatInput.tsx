'use client'

import { useState, useRef, useEffect } from 'react'
import { FaPaperPlane, FaImage } from 'react-icons/fa'

interface ChatInputProps {
 onSendMessage: (message: string) => void
 onTyping?: (isTyping: boolean) => void
 disabled?: boolean
 placeholder?: string
}

export function ChatInput({ onSendMessage, onTyping, disabled, placeholder }: ChatInputProps) {
 const [message, setMessage] = useState('')
 const [isTyping, setIsTyping] = useState(false)
 const inputRef = useRef<HTMLInputElement>(null)
 const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

 useEffect(() => {
 if (inputRef.current) {
 inputRef.current.focus()
 }
 return () => {
 if (typingTimeoutRef.current) {
 clearTimeout(typingTimeoutRef.current)
 }
 }
 }, [])

 const handleSend = () => {
 if (message.trim() && !disabled) {
 onSendMessage(message.trim())
 setMessage('')
 if (onTyping) {
 onTyping(false)
 }
 }
 }

 const handleKeyPress = (e: React.KeyboardEvent) => {
 if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault()
 handleSend()
 }
 }

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const value = e.target.value
 setMessage(value)

 if (onTyping) {
 if (value.length > 0 && !isTyping) {
 setIsTyping(true)
 onTyping(true)
 } else if (value.length === 0 && isTyping) {
 setIsTyping(false)
 onTyping(false)
 }

 if (typingTimeoutRef.current) {
 clearTimeout(typingTimeoutRef.current)
 }

 typingTimeoutRef.current = setTimeout(() => {
 if (isTyping) {
 setIsTyping(false)
 if (onTyping) {
 onTyping(false)
 }
 }
 }, 2000)
 }
 }

 return (
 <div className="flex gap-2">
 <button className="p-2 text-gray-600 hover:text-white transition-colors">
 <FaImage className="text-xl" />
 </button>
 <input
 ref={inputRef}
 type="text"
 placeholder={placeholder || 'Type a message...'}
 value={message}
 onChange={handleChange}
 onKeyDown={handleKeyPress}
 disabled={disabled}
 className="input-field flex-1 disabled:opacity-50"
 />
 <button
 onClick={handleSend}
 disabled={!message.trim() || disabled}
 className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <FaPaperPlane />
 </button>
 </div>
 )
}