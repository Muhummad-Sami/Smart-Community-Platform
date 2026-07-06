'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

interface SocketContextType {
 socket: Socket | null
 isConnected: boolean
 onlineUsers: string[]
 sendMessage: (receiverId: string, content: string, attachment?: string) => void
 markAsRead: (senderId: string) => void
 getConversation: (userId: string) => void
 startTyping: (receiverId: string) => void
 stopTyping: (receiverId: string) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const SocketProvider = ({ children }: { children: ReactNode }) => {
 const { user, isAuthenticated } = useAuth()
 const [socket, setSocket] = useState<Socket | null>(null)
 const [isConnected, setIsConnected] = useState(false)
 const [onlineUsers, setOnlineUsers] = useState<string[]>([])

 useEffect(() => {
 if (!isAuthenticated || !user) {
 if (socket) {
 socket.disconnect()
 setSocket(null)
 setIsConnected(false)
 }
 return
 }

 const token = sessionStorage.getItem('token')
 if (!token) {
 console.log('No token found, cannot connect socket')
 return
 }

 console.log('🔌 Connecting socket with token...')

 const socketURL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'
 console.log('🔌 Socket URL:', socketURL)

 const socketInstance = io(socketURL, {
 auth: { token },
 // ✅ Use both transports
 transports: ['websocket', 'polling'],
 reconnection: true,
 reconnectionAttempts: 10,
 reconnectionDelay: 1000,
 reconnectionDelayMax: 5000,
 timeout: 20000,
 withCredentials: true,
 })

 setSocket(socketInstance)

 socketInstance.on('connect', () => {
 console.log('🔌 Socket connected! ID:', socketInstance.id)
 setIsConnected(true)
 })

 socketInstance.on('disconnect', (reason) => {
 console.log('🔌 Socket disconnected, reason:', reason)
 setIsConnected(false)
 })

 socketInstance.on('connect_error', (error) => {
 console.error('❌ Socket connection error:', error.message)
 console.error('❌ Error details:', error)
 setIsConnected(false)
 })

 socketInstance.on('online-users', (users: string[]) => {
 console.log('👥 Online users:', users)
 setOnlineUsers(users)
 })

 socketInstance.on('user-online', ({ userId, status }) => {
 console.log('👤 User online status:', userId, status)
 if (status === 'online') {
 setOnlineUsers((prev) => {
 if (!prev.includes(userId)) {
 return [...prev, userId]
 }
 return prev
 })
 } else {
 setOnlineUsers((prev) => prev.filter((id) => id !== userId))
 }
 })

 return () => {
 console.log('🧹 Cleaning up socket...')
 socketInstance.disconnect()
 setSocket(null)
 setIsConnected(false)
 }
 }, [user, isAuthenticated])

 const sendMessage = (receiverId: string, content: string, attachment?: string) => {
 if (socket && isConnected) {
 console.log('📤 Emitting send-message:', { receiverId, content })
 socket.emit('send-message', { receiverId, content, attachment })
 } else {
 console.log('❌ Socket not connected, message not sent')
 }
 }

 const markAsRead = (senderId: string) => {
 if (socket && isConnected) {
 socket.emit('mark-read', { senderId })
 }
 }

 const getConversation = (userId: string) => {
 if (socket && isConnected) {
 console.log('📥 Getting conversation for user:', userId)
 socket.emit('get-conversation', { userId })
 }
 }

 const startTyping = (receiverId: string) => {
 if (socket && isConnected) {
 socket.emit('typing', { receiverId, isTyping: true })
 }
 }

 const stopTyping = (receiverId: string) => {
 if (socket && isConnected) {
 socket.emit('typing', { receiverId, isTyping: false })
 }
 }

 return (
 <SocketContext.Provider
 value={{
 socket,
 isConnected,
 onlineUsers,
 sendMessage,
 markAsRead,
 getConversation,
 startTyping,
 stopTyping,
 }}
 >
 {children}
 </SocketContext.Provider>
 )
}

export const useSocket = () => {
 const context = useContext(SocketContext)
 if (context === undefined) {
 throw new Error('useSocket must be used within a SocketProvider')
 }
 return context
}