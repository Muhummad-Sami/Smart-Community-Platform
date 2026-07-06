'use client'

import { useAuth } from '@/context/AuthContext'
import { useSocket } from '@/context/SocketContext'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { 
 FaComments, FaSearch, FaPaperPlane, FaArrowLeft, 
 FaCheck, FaCheckDouble, FaUser, FaTimes, FaPlus,
 FaMicrophone, FaStop
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { messageService, Message, Conversation } from '@/services/api/message'
import api from '@/services/api/api'

export default function MessagesPage() {
 const { user } = useAuth()
 const router = useRouter()
 const searchParams = useSearchParams()
 const { socket, onlineUsers, sendMessage, markAsRead, getConversation } = useSocket()
 const userIdParam = searchParams.get('userId')
 const messagesEndRef = useRef<HTMLDivElement>(null)
 
 const [conversations, setConversations] = useState<Conversation[]>([])
 const [allUsers, setAllUsers] = useState<any[]>([])
 const [selectedUser, setSelectedUser] = useState<string | null>(userIdParam || null)
 const [messages, setMessages] = useState<Message[]>([])
 const [inputMessage, setInputMessage] = useState('')
 const [loading, setLoading] = useState(true)
 const [loadingMessages, setLoadingMessages] = useState(false)
 const [searchTerm, setSearchTerm] = useState('')
 const [searchUser, setSearchUser] = useState('')
 const [showNewConversation, setShowNewConversation] = useState(false)
 const [typingIndicator, setTypingIndicator] = useState<{ userId: string; isTyping: boolean } | null>(null)
 const [isUserTyping, setIsUserTyping] = useState(false)
 const [messageMap, setMessageMap] = useState<Map<string, Message>>(new Map())
 const [isRecording, setIsRecording] = useState(false)
 const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
 const mediaRecorderRef = useRef<MediaRecorder | null>(null)
 const audioChunksRef = useRef<Blob[]>([])

 const startRecording = async () => {
 try {
 const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
 const mediaRecorder = new MediaRecorder(stream)
 mediaRecorderRef.current = mediaRecorder
 audioChunksRef.current = []

 mediaRecorder.ondataavailable = (event) => {
 if (event.data.size > 0) {
 audioChunksRef.current.push(event.data)
 }
 }

 mediaRecorder.onstop = () => {
 const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
 setAudioBlob(audioBlob)
 }

 mediaRecorder.start()
 setIsRecording(true)
 } catch (err) {
 toast.error('Microphone access denied')
 }
 }

 const stopRecording = () => {
 if (mediaRecorderRef.current && isRecording) {
 mediaRecorderRef.current.stop()
 setIsRecording(false)
 mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
 }
 }

 const sendAudioMessage = async () => {
    if (!audioBlob || !selectedUser) return
    
    try {
      // Convert audio blob to base64 data URL
      const reader = new FileReader()
      reader.readAsDataURL(audioBlob)
      reader.onloadend = () => {
        const base64Audio = reader.result as string
        sendMessage(selectedUser, '🔊 Voice Message', base64Audio)
        setAudioBlob(null)
        toast.success('Voice message sent!')
      }
    } catch (err) {
      toast.error('Failed to send voice message')
    }
  }

 const isAdmin = user?.role === 'ADMIN'

 // ✅ Fetch conversations
 const fetchConversations = useCallback(async () => {
 try {
 const response = await messageService.getConversations()
 console.log('📋 Conversations loaded:', response.data)
 setConversations(response.data || [])
 } catch (error) {
 console.error('Error fetching conversations:', error)
 } finally {
 setLoading(false)
 }
 }, [])

 // ✅ Fetch all users for admin
 const fetchAllUsers = useCallback(async () => {
 try {
 const response = await api.get('/messages/users')
 setAllUsers(response.data.data || [])
 } catch (error) {
 console.error('Error fetching all users:', error)
 }
 }, [])

 // ✅ Load conversation messages
 const loadConversationMessages = useCallback(async (userId: string) => {
 if (!userId) return
 
 setLoadingMessages(true)
 try {
 // Get messages via socket
 getConversation(userId)
 markAsRead(userId)
 
 // Also fetch via API
 const response = await messageService.getConversation(userId)
 console.log('📜 Messages loaded:', response.data)
 
 if (response.data && response.data.length > 0) {
 // ✅ Build message map to avoid duplicates
 const newMap = new Map<string, Message>()
 response.data.forEach((msg: Message) => {
 newMap.set(msg.id, msg)
 })
 setMessageMap(newMap)
 setMessages(Array.from(newMap.values()))
 } else {
 setMessageMap(new Map())
 setMessages([])
 }
 } catch (error) {
 console.error('Error loading conversation:', error)
 } finally {
 setLoadingMessages(false)
 }
 }, [getConversation, markAsRead])

 // ✅ Load conversations on mount
 useEffect(() => {
 if (user) {
 fetchConversations()
 if (isAdmin) {
 fetchAllUsers()
 }
 }
 }, [user, fetchConversations, fetchAllUsers, isAdmin])

 // ✅ Load messages when a user is selected
 useEffect(() => {
 if (selectedUser) {
 loadConversationMessages(selectedUser)
 }
 }, [selectedUser, loadConversationMessages])

 // ✅ Auto-scroll to bottom
 useEffect(() => {
 if (messagesEndRef.current) {
 messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
 }
 }, [messages])

 // ✅ Auto-select user from URL parameter
 useEffect(() => {
 if (userIdParam && conversations.length > 0) {
 setSelectedUser(userIdParam)
 loadConversationMessages(userIdParam)
 }
 }, [userIdParam, conversations, loadConversationMessages])

 // ✅ Socket event listeners
 useEffect(() => {
 if (!socket) return

 console.log('🔄 Setting up socket listeners...')

 // ✅ Handle new message
 const handleNewMessage = (message: Message) => {
 console.log('📩 New message received:', message)
 
 // Update message map
 setMessageMap(prev => {
 const newMap = new Map(prev)
 // Only add if not exists
 if (!newMap.has(message.id)) {
 newMap.set(message.id, message)
 }
 return newMap
 })
 
 // Update messages state
 setMessages(prev => {
 const exists = prev.some(m => m.id === message.id)
 if (exists) {
 return prev.map(m => m.id === message.id ? { ...message, delivered: true } : m)
 }
 return [...prev, { ...message, delivered: true }]
 })
 
 // Update conversations list
 fetchConversations()
 }

 // ✅ Handle message sent confirmation
 const handleMessageSent = (message: Message) => {
 console.log('📤 Message sent:', message)
 
 // Replace temp message with real message
 setMessages(prev => {
 const hasTemp = prev.some(m => m.id.startsWith('temp-'))
 if (hasTemp) {
 return prev.map(m => {
 if (m.id.startsWith('temp-') && m.content === message.content) {
 return { ...message, delivered: true }
 }
 return m
 })
 }
 // If no temp, add the message
 const exists = prev.some(m => m.id === message.id)
 if (!exists) {
 return [...prev, { ...message, delivered: true }]
 }
 return prev
 })
 
 // Update message map
 setMessageMap(prev => {
 const newMap = new Map(prev)
 if (!newMap.has(message.id)) {
 newMap.set(message.id, message)
 }
 return newMap
 })
 }

 // ✅ Handle messages read
 const handleMessagesRead = ({ messages: readMessages }: any) => {
 console.log('📖 Messages read:', readMessages)
 if (readMessages && readMessages.length > 0) {
 setMessages(prev => {
 return prev.map(msg => {
 const readMsg = readMessages.find((m: Message) => m.id === msg.id)
 if (readMsg) {
 return { ...msg, isRead: true }
 }
 return msg
 })
 })
 fetchConversations()
 }
 }

 // ✅ Handle conversation history
 const handleConversationHistory = (historyMessages: Message[]) => {
 console.log('📜 Conversation history received:', historyMessages.length)
 if (historyMessages && historyMessages.length > 0) {
 // Build map to avoid duplicates
 const newMap = new Map<string, Message>()
 historyMessages.forEach((msg: Message) => {
 newMap.set(msg.id, msg)
 })
 
 // Merge with existing messages
 setMessageMap(prev => {
 const merged = new Map(prev)
 newMap.forEach((value, key) => {
 if (!merged.has(key)) {
 merged.set(key, value)
 }
 })
 return merged
 })
 
 setMessages(Array.from(newMap.values()))
 
 // Mark as read
 historyMessages
 .filter((msg) => msg.senderId !== user?.id && !msg.isRead)
 .forEach((msg) => {
 markAsRead(msg.senderId)
 })
 }
 }

 // ✅ Handle typing indicator
 const handleUserTyping = ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
 if (userId === selectedUser) {
 setTypingIndicator({ userId, isTyping })
 setTimeout(() => {
 setTypingIndicator(null)
 }, 3000)
 }
 }

 // Register listeners
 socket.on('new-message', handleNewMessage)
 socket.on('message-sent', handleMessageSent)
 socket.on('messages-read', handleMessagesRead)
 socket.on('conversation-history', handleConversationHistory)
 socket.on('user-typing', handleUserTyping)

 return () => {
 console.log('🧹 Cleaning up socket listeners...')
 socket.off('new-message', handleNewMessage)
 socket.off('message-sent', handleMessageSent)
 socket.off('messages-read', handleMessagesRead)
 socket.off('conversation-history', handleConversationHistory)
 socket.off('user-typing', handleUserTyping)
 }
 }, [socket, selectedUser, fetchConversations, markAsRead, user?.id])

 // ✅ Handle selecting a user
 const handleSelectUser = (userId: string) => {
 if (userId === selectedUser) return
 setSelectedUser(userId)
 setMessageMap(new Map())
 loadConversationMessages(userId)
 setShowNewConversation(false)
 }

 // ✅ Handle sending message
 const handleSendMessage = () => {
 if (!inputMessage.trim() || !selectedUser) return
 
 console.log('📤 Sending message to:', selectedUser)
 
 const tempId = 'temp-' + Date.now()
 const tempMessage: Message = {
 id: tempId,
 content: inputMessage.trim(),
 senderId: user?.id || '',
 receiverId: selectedUser,
 isRead: false,
 delivered: false,
 readAt: null,
 attachment: null,
 createdAt: new Date().toISOString(),
 sender: {
 id: user?.id || '',
 fullName: user?.fullName || '',
 profilePicture: user?.profilePicture || null,
 },
 receiver: {
 id: selectedUser,
 fullName: conversations.find(c => c.user.id === selectedUser)?.user.fullName || '',
 profilePicture: null,
 }
 }
 
 // Add temp message
 setMessages(prev => [...prev, tempMessage])
 
 // Send
 sendMessage(selectedUser, inputMessage.trim())
 setInputMessage('')
 
 if (isUserTyping) {
 setIsUserTyping(false)
 socket?.emit('typing', { receiverId: selectedUser, isTyping: false })
 }
 }

 const handleKeyPress = (e: React.KeyboardEvent) => {
 if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault()
 handleSendMessage()
 }
 }

 const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
 const value = e.target.value
 setInputMessage(value)
 
 if (selectedUser) {
 if (value.length > 0 && !isUserTyping) {
 setIsUserTyping(true)
 socket?.emit('typing', { receiverId: selectedUser, isTyping: true })
 } else if (value.length === 0 && isUserTyping) {
 setIsUserTyping(false)
 socket?.emit('typing', { receiverId: selectedUser, isTyping: false })
 }
 }
 }

 const getMessageStatus = (message: Message) => {
 if (message.senderId !== user?.id) return null
 
 if (message.isRead) {
 return <FaCheckDouble className="text-blue-500 text-xs" />
 }
 
 const isReceiverOnline = selectedUser ? onlineUsers.includes(selectedUser) : false
 if (isReceiverOnline || message.delivered) {
 return <FaCheckDouble className="text-gray-400 text-xs" />
 }
 
 return <FaCheck className="text-gray-400 text-xs" />
 }

 const getTimeAgo = (date: string) => {
 if (!date) return ''
 const diff = Date.now() - new Date(date).getTime()
 const minutes = Math.floor(diff / 60000)
 if (minutes < 1) return 'Just now'
 if (minutes < 60) return `${minutes}m ago`
 const hours = Math.floor(minutes / 60)
 if (hours < 24) return `${hours}h ago`
 const days = Math.floor(hours / 24)
 return `${days}d ago`
 }

 const filteredConversations = conversations.filter((conv) =>
 conv.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
 )

 const filteredUsers = allUsers.filter((u) =>
 u.fullName?.toLowerCase().includes(searchUser.toLowerCase()) ||
 u.email?.toLowerCase().includes(searchUser.toLowerCase())
 )

 if (!user) {
 return (
 <div className="min-h-screen flex items-center justify-center px-4">
 <div className="text-center">
 <h2 className="text-2xl font-bold text-primary-900 mb-4">Please Login</h2>
 <Link href="/login" className="btn-primary">Go to Login</Link>
 </div>
 </div>
 )
 }

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="spinner"></div>
 </div>
 )
 }

 const selectedUserData = conversations.find((c) => c.user?.id === selectedUser)
 const isUserOnline = selectedUser ? onlineUsers.includes(selectedUser) : false

 return (
 <div className="min-h-screen py-24 px-4 bg-background">
 <div className="container-custom max-w-6xl mx-auto">
 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className="text-3xl md:text-4xl font-bold gradient-text flex items-center gap-3 mb-1">
 <FaComments className="text-primary-500" /> Messages
 </h1>
 <p className="text-primary-800 text-sm">
 You have {conversations.length} active conversation{conversations.length !== 1 && 's'}
 </p>
 </div>
 <Link href="/dashboard" className="btn-secondary">
 Back to Dashboard
 </Link>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[75vh]">
 {/* Inbox List */}
 <div className="card p-0 flex flex-col overflow-hidden">
 <div className="p-4 border-b border-gray-200 bg-white">
 {isAdmin && (
 <div className="mb-4">
 <button
 onClick={() => setShowNewConversation(!showNewConversation)}
 className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2"
 >
 {showNewConversation ? <FaTimes /> : <FaPlus />} 
 {showNewConversation ? 'Close' : 'New Conversation'}
 </button>
 
 {showNewConversation && (
 <div className="mt-3 bg-white border border-gray-200 rounded-xl p-3 max-h-60 overflow-y-auto">
 <input
 type="text"
 placeholder="Search users..."
 value={searchUser}
 onChange={(e) => setSearchUser(e.target.value)}
 className="input-field py-2 text-sm mb-2"
 />
 {filteredUsers.length === 0 ? (
 <p className="text-primary-800 text-sm text-center py-4">No users found</p>
 ) : (
 filteredUsers.map((u) => (
 <button
 key={u.id}
 onClick={() => handleSelectUser(u.id)}
 className="w-full p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-left flex items-center gap-3"
 >
 <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-primary-900 font-bold text-xs flex-shrink-0">
 {u.fullName?.charAt(0) || 'U'}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-primary-900 text-sm font-medium truncate mb-0.5">{u.fullName}</p>
 <p className="text-[10px] text-primary-800 truncate">{u.email}</p>
 </div>
 <span className="badge badge-secondary text-[9px]">{u.role}</span>
 </button>
 ))
 )}
 </div>
 )}
 </div>
 )}

 <div className="relative">
 <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-800 text-sm" />
 <input
 type="text"
 placeholder="Search conversations..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="input-field pl-9 py-2 text-sm bg-white border-transparent focus:border-[#14B8A6] focus:bg-gray-100"
 />
 </div>
 </div>

 <div className="flex-1 overflow-y-auto p-3 space-y-1">
 {filteredConversations.length === 0 ? (
 <div className="text-center text-primary-800 py-10">
 <FaComments className="text-4xl mx-auto mb-3 opacity-50" />
 <p className="text-sm font-medium text-primary-800">No conversations</p>
 <p className="text-xs mt-1">Start chatting from a service page.</p>
 </div>
 ) : (
 filteredConversations.map((conv) => (
 <button
 key={conv.user.id}
 onClick={() => handleSelectUser(conv.user.id)}
 className={`w-full p-3 rounded-xl transition-all duration-200 text-left ${
 selectedUser === conv.user.id
 ? 'bg-gray-100 shadow-lg border border-gray-200'
 : 'hover:bg-white border border-transparent'
 }`}
 >
 <div className="flex items-center gap-3">
 <div className="relative flex-shrink-0">
 <div className="w-11 h-11 rounded-xl bg-primary-500 flex items-center justify-center text-primary-900 font-bold text-sm shadow-md">
 {conv.user.fullName?.charAt(0) || 'U'}
 </div>
 {onlineUsers.includes(conv.user.id) && (
 <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#4ade80] rounded-full border-[3px] border-background"></div>
 )}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex justify-between items-start mb-1">
 <p className={`font-medium truncate text-sm ${selectedUser === conv.user.id ? 'text-primary-900' : 'text-primary-900'}`}>
 {conv.user.fullName}
 </p>
 {conv.lastMessage && (
 <span className={`text-[10px] flex-shrink-0 ml-2 ${conv.unreadCount > 0 ? 'text-[#60a5fa] font-medium' : 'text-primary-800'}`}>
 {getTimeAgo(conv.lastMessage.createdAt)}
 </span>
 )}
 </div>
 <div className="flex justify-between items-center">
 <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-primary-900 font-medium' : 'text-primary-800'}`}>
 {conv.lastMessage?.content || 'No messages yet'}
 </p>
 {conv.unreadCount > 0 && (
 <span className="bg-gradient-to-r from-[#14B8A6] to-[#60a5fa] text-primary-900 text-[10px] font-bold rounded-full h-4 min-w-4 px-1.5 flex items-center justify-center flex-shrink-0 ml-2 shadow-lg">
 {conv.unreadCount}
 </span>
 )}
 </div>
 </div>
 </div>
 </button>
 ))
 )}
 </div>
 </div>

 {/* Chat Window */}
 <div className="md:col-span-2 card p-0 flex flex-col overflow-hidden relative">
 {selectedUser ? (
 <>
 <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white flex-shrink-0">
 <div className="flex items-center gap-3">
 <button
 onClick={() => setSelectedUser(null)}
 className="md:hidden w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary-800 hover:text-primary-900 hover:bg-gray-100 transition-colors"
 >
 <FaArrowLeft className="text-sm" />
 </button>
 <div className="relative flex-shrink-0">
 <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-primary-900 font-bold text-sm shadow-md">
 {selectedUserData?.user?.fullName?.charAt(0) || 'U'}
 </div>
 {isUserOnline && (
 <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#4ade80] rounded-full border-[3px] border-background"></div>
 )}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-primary-900 font-semibold text-sm truncate">
 {selectedUserData?.user?.fullName || 'User'}
 </p>
 <p className="text-[11px] font-medium">
 {isUserOnline ? (
 <span className="text-[#4ade80]">Online</span>
 ) : (
 <span className="text-primary-800">Offline</span>
 )}
 </p>
 </div>
 </div>
 
 {/* Optional actions here like viewing profile */}
 <div className="flex gap-2">
 <button className="w-8 h-8 rounded-lg text-primary-800 hover:text-primary-900 hover:bg-gray-100 flex items-center justify-center transition-colors">
 <FaUser className="text-sm" />
 </button>
 </div>
 </div>

 {/* Messages Area */}
 <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-black/20">
 {loadingMessages ? (
 <div className="h-full flex items-center justify-center">
 <div className="spinner"></div>
 </div>
 ) : messages.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center text-center">
 <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-4">
 <FaComments className="text-2xl text-primary-800" />
 </div>
 <h3 className="text-primary-900 font-semibold mb-1">Start the conversation</h3>
 <p className="text-sm text-primary-800">Send a message to {selectedUserData?.user?.fullName || 'this user'}</p>
 </div>
 ) : (
 messages.map((msg, index) => {
 const isOwn = msg.senderId === user.id
 const showSenderName = !isOwn && (index === 0 || messages[index - 1]?.senderId !== msg.senderId)
 
 return (
 <div
 key={msg.id}
 className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
 >
 <div className={`max-w-[75%] md:max-w-[65%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
 {showSenderName && !isOwn && (
 <span className="text-[11px] font-medium text-primary-800 mb-1 ml-1">
 {msg.sender?.fullName || 'User'}
 </span>
 )}
 <div
 className={`px-4 py-2.5 rounded-2xl shadow-md ${
 isOwn
 ? 'bg-primary-500 text-primary-900 rounded-tr-sm'
 : 'bg-gray-100 border border-gray-200 text-primary-900 rounded-tl-sm'
 }`}
 >
 {msg.attachment && msg.attachment.startsWith('data:audio') ? (
 <div className="flex flex-col gap-2">
 <span className="text-xs opacity-70">🔊 Voice Message</span>
 <audio src={msg.attachment} controls className="h-8 max-w-[200px]" />
 </div>
 ) : (
 <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
 )}
 </div>
 <div className={`flex items-center gap-1.5 mt-1.5 ${isOwn ? 'mr-1' : 'ml-1'}`}>
 <span className="text-[10px] text-primary-800 font-medium">
 {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </span>
 {isOwn && getMessageStatus(msg)}
 </div>
 </div>
 </div>
 )
 })
 )}
 
 {typingIndicator?.userId === selectedUser && typingIndicator.isTyping && (
 <div className="flex justify-start">
 <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm">
 <div className="flex gap-1.5">
 <span className="w-1.5 h-1.5 bg-[#60a5fa] rounded-full animate-bounce"></span>
 <span className="w-1.5 h-1.5 bg-[#60a5fa] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
 <span className="w-1.5 h-1.5 bg-[#60a5fa] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
 </div>
 </div>
 </div>
 )}
 <div ref={messagesEndRef} />
 </div>

 {/* Input Area */}
 <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
 {audioBlob && (
 <div className="flex items-center justify-between mb-3 bg-white p-2 rounded-lg">
 <audio src={URL.createObjectURL(audioBlob)} controls className="h-8 max-w-[200px]" />
 <div className="flex gap-2">
 <button onClick={() => setAudioBlob(null)} className="text-red-400 hover:text-red-300">
 <FaTimes />
 </button>
 <button onClick={sendAudioMessage} className="text-green-400 hover:text-green-300">
 <FaPaperPlane />
 </button>
 </div>
 </div>
 )}
 <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl p-1 shadow-inner focus-within:border-[#14B8A6]/50 focus-within:bg-gray-100 transition-all duration-200">
 <button
 onClick={isRecording ? stopRecording : startRecording}
 className={`w-11 h-11 mb-0.5 ml-0.5 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-transparent text-primary-800 hover:text-primary-900 hover:bg-gray-100'}`}
 >
 {isRecording ? <FaStop className="text-sm" /> : <FaMicrophone className="text-sm" />}
 </button>
 <textarea
 placeholder="Type your message..."
 value={inputMessage}
 onChange={handleTyping}
 onKeyDown={(e) => {
 if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault()
 handleSendMessage()
 }
 }}
 className="flex-1 bg-transparent border-none text-sm text-primary-900 resize-none max-h-32 min-h-[44px] py-3 px-2 outline-none placeholder:text-primary-800"
 rows={1}
 />
 <button
 onClick={handleSendMessage}
 disabled={!inputMessage.trim()}
 className="w-11 h-11 mb-0.5 mr-0.5 rounded-xl bg-primary-500 flex items-center justify-center text-primary-900 disabled:opacity-50 disabled:grayscale transition-all duration-200 hover:shadow-lg flex-shrink-0"
 >
 <FaPaperPlane className="text-sm -ml-0.5" />
 </button>
 </div>
 <p className="text-[10px] text-primary-800 text-center mt-2">
 Press Enter to send, Shift + Enter for new line
 </p>
 </div>
 </>
 ) : (
 <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-transparent to-black/20">
 <div className="w-24 h-24 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-6 shadow-2xl">
 <FaComments className="text-4xl text-primary-500 opacity-80" />
 </div>
 <h3 className="text-2xl font-bold text-primary-900 mb-2">Your Messages</h3>
 <p className="text-primary-800 max-w-sm">
 Select a conversation from the sidebar or start a new one to connect with others.
 </p>
 </div>
 )}
 </div> 
 </div>
 </div>
 </div>
 )
}