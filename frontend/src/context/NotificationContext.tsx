'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import api from '@/services/api/api'
import { useAuth } from './AuthContext'
import { useSocket } from './SocketContext'

interface Notification {
 id: string
 type: string
 title: string
 content: string
 isRead: boolean
 link?: string
 image?: string
 createdAt: string
}

interface NotificationContextType {
 notifications: Notification[]
 unreadCount: number
 markAsRead: (id: string) => Promise<void>
 markAllAsRead: () => Promise<void>
 fetchNotifications: () => Promise<void>
 addNotification: (notification: Notification) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
 const { user, isAuthenticated } = useAuth()
 const [notifications, setNotifications] = useState<Notification[]>([])

 const { socket } = useSocket()

 const fetchNotifications = useCallback(async () => {
 if (!isAuthenticated) return
 try {
 const response = await api.get('/notifications')
 setNotifications(response.data?.data || [])
 } catch (error) {
 // Silent fail - notifications are non-critical
 }
 }, [isAuthenticated])

 useEffect(() => {
 if (isAuthenticated && user) {
 fetchNotifications()
 const interval = setInterval(fetchNotifications, 30000)
 return () => clearInterval(interval)
 } else {
 setNotifications([])
 }
 }, [isAuthenticated, user, fetchNotifications])

 useEffect(() => {
 if (socket) {
 const handleNewNotification = (notification: Notification) => {
 setNotifications(prev => [notification, ...prev])
 }
 socket.on('new-notification', handleNewNotification)
 return () => {
 socket.off('new-notification', handleNewNotification)
 }
 }
 }, [socket])

 const markAsRead = async (id: string) => {
 try {
 await api.patch(`/notifications/${id}/read`)
 setNotifications(prev =>
 prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
 )
 } catch (error) {}
 }

 const markAllAsRead = async () => {
 try {
 await api.patch('/notifications/read-all')
 setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
 } catch (error) {}
 }

 const addNotification = (notification: Notification) => {
 setNotifications(prev => [notification, ...prev])
 }

 const unreadCount = notifications.filter(n => !n.isRead).length

 return (
 <NotificationContext.Provider
 value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications, addNotification }}
 >
 {children}
 </NotificationContext.Provider>
 )
}

export const useNotifications = () => {
 const context = useContext(NotificationContext)
 if (context === undefined) {
 throw new Error('useNotifications must be used within a NotificationProvider')
 }
 return context
}
