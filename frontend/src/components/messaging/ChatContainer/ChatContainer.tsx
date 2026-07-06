// frontend/src/components/messaging/ChatContainer.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import { ChatWindow } from '../ChatWindow'
import { ConversationList } from '../ConversationList'
import { useSocket } from '@/hooks/useSocket'
import { messageService, Message, Conversation } from '@/services/api/message'

interface ChatContainerProps {
 currentUserId: string
}

export function ChatContainer({ currentUserId }: ChatContainerProps) {
 const [messages, setMessages] = useState<Message[]>([])
 const [conversations, setConversations] = useState<Conversation[]>([])
 const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
 const [onlineUsers, setOnlineUsers] = useState<string[]>([])
 const [isTyping, setIsTyping] = useState(false)
 const [loading, setLoading] = useState(false)
 
 const { socket, isConnected } = useSocket()
 const processedMessages = useRef<Set<string>>(new Set()) // Track processed messages

 // Load conversations
 useEffect(() => {
 loadConversations()
 }, [])

 const loadConversations = async () => {
 try {
 setLoading(true)
 const response = await messageService.getConversations()
 setConversations(response.data || [])
 } catch (error) {
 console.error('Failed to load conversations:', error)
 } finally {
 setLoading(false)
 }
 }

 // Load messages when user is selected
 useEffect(() => {
 if (selectedUserId) {
 loadMessages(selectedUserId)
 }
 }, [selectedUserId])

 const loadMessages = async (userId: string) => {
 try {
 setLoading(true)
 const response = await messageService.getMessages(userId)
 setMessages(response.data || [])
 // Clear processed messages when loading new conversation
 processedMessages.current.clear()
 } catch (error) {
 console.error('Failed to load messages:', error)
 } finally {
 setLoading(false)
 }
 }

 // Socket listeners - Prevents duplicates
 useEffect(() => {
 if (!socket || !isConnected) return

 // Handle new message - Prevents duplicates
 const handleNewMessage = (newMessage: Message) => {
 // Create unique key
 const messageKey = newMessage.id || newMessage.tempId || ''
 
 // Skip if already processed
 if (processedMessages.current.has(messageKey)) {
 console.log('Duplicate message ignored:', messageKey)
 return
 }
 
 // Mark as processed
 processedMessages.current.add(messageKey)

 // Update messages - prevent duplicates in state
 setMessages(prev => {
 // Check if message already exists in state
 const exists = prev.some(m => 
 m.id === newMessage.id || 
 (m.tempId && m.tempId === newMessage.tempId)
 )
 
 if (exists) {
 // Replace temp message with real one
 return prev.map(m => {
 if (m.tempId && m.tempId === newMessage.tempId) {
 return { ...newMessage, status: 'delivered' }
 }
 return m
 })
 }
 
 return [...prev, { ...newMessage, status: 'delivered' }]
 })

 // Update conversation list
 setConversations(prev => {
 const existing = prev.find(c => c.user.id === newMessage.senderId)
 if (existing) {
 return prev.map(c => 
 c.user.id === newMessage.senderId 
 ? { ...c, lastMessage: newMessage, unreadCount: (c.unreadCount || 0) + 1 }
 : c
 )
 }
 // If conversation doesn't exist, add it
 if (newMessage.sender) {
 return [...prev, {
 user: newMessage.sender as any,
 lastMessage: newMessage,
 unreadCount: 1
 }]
 }
 return prev
 })
 }

 // Handle message delivered confirmation
 const handleMessageDelivered = (deliveredMessage: Message) => {
 setMessages(prev => 
 prev.map(m => {
 if (m.tempId && m.tempId === deliveredMessage.tempId) {
 return { ...deliveredMessage, status: 'delivered' }
 }
 return m
 })
 )
 }

 // Handle typing indicator
 const handleTyping = (data: { userId: string; isTyping: boolean }) => {
 if (data.userId === selectedUserId) {
 setIsTyping(data.isTyping)
 }
 }

 // Handle online users
 const handleOnlineUsers = (users: string[]) => {
 setOnlineUsers(users)
 }

 // Register listeners - ONLY ONCE
 socket.on('messageReceived', handleNewMessage)
 socket.on('messageDelivered', handleMessageDelivered)
 socket.on('typing', handleTyping)
 socket.on('onlineUsers', handleOnlineUsers)

 // Cleanup - Prevents duplicate listeners
 return () => {
 socket.off('messageReceived', handleNewMessage)
 socket.off('messageDelivered', handleMessageDelivered)
 socket.off('typing', handleTyping)
 socket.off('onlineUsers', handleOnlineUsers)
 }
 }, [socket, isConnected, selectedUserId])

 // Send message - Only sends once
 const handleSendMessage = async (content: string) => {
 if (!selectedUserId || !socket || !isConnected) return

 const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`
 
 // Create temporary message
 const tempMessage: any = {
 id: tempId,
 tempId,
 content,
 senderId: currentUserId,
 receiverId: selectedUserId,
 createdAt: new Date().toISOString(),
 status: 'sending',
 isRead: false,
 readAt: null,
 attachment: null,
 sender: {
 id: currentUserId,
 fullName: 'You',
 profilePicture: null
 },
 receiver: {
 id: selectedUserId,
 fullName: '',
 profilePicture: null
 }
 }

 // Add optimistically - ONLY ONCE
 setMessages(prev => [...prev, tempMessage])
 processedMessages.current.add(tempId)

 try {
 // Send message via socket - ONLY ONCE
 socket.emit('sendMessage', {
 tempId,
 receiverId: selectedUserId,
 content
 })
 } catch (error) {
 console.error('Failed to send message:', error)
 // Mark as failed
 setMessages(prev => prev.map(msg =>
 msg.id === tempId ? { ...msg, status: 'failed' } : msg
 ))
 }
 }

 // Handle typing
 const handleTyping = (isTyping: boolean) => {
 if (socket && isConnected && selectedUserId) {
 socket.emit('typing', { receiverId: selectedUserId, isTyping })
 }
 }

 // Select user
 const handleSelectUser = (userId: string) => {
 if (userId === selectedUserId) return
 setSelectedUserId(userId)
 // Clear processed messages when switching users
 processedMessages.current.clear()
 // Mark messages as read
 if (socket && isConnected) {
 socket.emit('markRead', { userId })
 }
 // Also call API to mark as read
 messageService.markAsRead(userId).catch(console.error)
 }

 // Get selected user details
 const selectedUser = selectedUserId 
 ? conversations.find(c => c.user.id === selectedUserId)?.user || null
 : null

 return (
 <div className="flex h-[600px] glass rounded-2xl overflow-hidden">
 {/* Conversations List */}
 <div className="w-80 border-r border-gray-200 p-4">
 <ConversationList
 conversations={conversations}
 selectedUserId={selectedUserId}
 onSelectUser={handleSelectUser}
 onlineUsers={onlineUsers}
 loading={loading}
 />
 </div>

 {/* Chat Window */}
 <div className="flex-1">
 <ChatWindow
 messages={messages}
 selectedUser={selectedUser}
 isOnline={selectedUserId ? onlineUsers.includes(selectedUserId) : false}
 isTyping={isTyping}
 onSendMessage={handleSendMessage}
 onTyping={handleTyping}
 loading={loading}
 currentUserId={currentUserId}
 />
 </div>
 </div>
 )
}