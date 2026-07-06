'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { FaBell, FaTimes } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useSocket } from '@/context/SocketContext'
import { notificationService, Notification } from '@/services/api/notification'
import { toast } from 'react-hot-toast'

export function NotificationBell() {
 const { user } = useAuth()
 const { socket } = useSocket()
 const [notifications, setNotifications] = useState<Notification[]>([])
 const [unreadCount, setUnreadCount] = useState(0)
 const [isOpen, setIsOpen] = useState(false)
 const [loading, setLoading] = useState(true)
 const dropdownRef = useRef<HTMLDivElement>(null)

 // ✅ Fetch notifications and unread count
 const fetchNotifications = useCallback(async () => {
 try {
 const response = await notificationService.getNotifications()
 setNotifications(response.data || [])
 } catch (error) {
 console.error('Error fetching notifications:', error)
 } finally {
 setLoading(false)
 }
 }, [])

 const fetchUnreadCount = useCallback(async () => {
 try {
 const response = await notificationService.getUnreadCount()
 setUnreadCount(response.data.count || 0)
 } catch (error) {
 console.error('Error fetching unread count:', error)
 }
 }, [])

 // ✅ Initial fetch
 useEffect(() => {
 if (user) {
 fetchNotifications()
 fetchUnreadCount()
 }
 }, [user, fetchNotifications, fetchUnreadCount])

 // ✅ Socket listeners for real-time updates
 useEffect(() => {
 if (!socket) return

 const handleNewNotification = (notification: Notification) => {
 console.log('🔔 New notification:', notification)
 setNotifications(prev => [notification, ...prev])
 setUnreadCount(prev => prev + 1)
 
 // Show toast
 toast.success(notification.title)
 
 // Animate bell
 const bell = document.getElementById('notification-bell')
 if (bell) {
 bell.classList.add('animate-ring')
 setTimeout(() => {
 bell.classList.remove('animate-ring')
 }, 1000)
 }
 }

 // ✅ Handle notification read event from socket
 const handleNotificationRead = ({ notificationId }: { notificationId: string }) => {
 console.log('📖 Notification read:', notificationId)
 setNotifications(prev => 
 prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
 )
 fetchUnreadCount()
 }

 // ✅ Handle all notifications read
 const handleAllNotificationsRead = () => {
 console.log('📖 All notifications read')
 setNotifications(prev => 
 prev.map(n => ({ ...n, isRead: true }))
 )
 setUnreadCount(0)
 }

 socket.on('new-notification', handleNewNotification)
 socket.on('notification-read', handleNotificationRead)
 socket.on('all-notifications-read', handleAllNotificationsRead)

 return () => {
 socket.off('new-notification', handleNewNotification)
 socket.off('notification-read', handleNotificationRead)
 socket.off('all-notifications-read', handleAllNotificationsRead)
 }
 }, [socket, fetchUnreadCount])

 // ✅ Click outside to close
 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
 setIsOpen(false)
 }
 }
 document.addEventListener('mousedown', handleClickOutside)
 return () => document.removeEventListener('mousedown', handleClickOutside)
 }, [])

 // ✅ Mark single notification as read
 const markAsRead = async (id: string) => {
 try {
 await notificationService.markAsRead(id)
 setNotifications(prev =>
 prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
 )
 setUnreadCount(prev => Math.max(0, prev - 1))
 
 // Emit socket event
 socket?.emit('notification-read', { notificationId: id })
 } catch (error) {
 console.error('Error marking notification as read:', error)
 }
 }

 // ✅ Mark all notifications as read
 const markAllAsRead = async () => {
 try {
 await notificationService.markAllAsRead()
 setNotifications(prev =>
 prev.map((n) => ({ ...n, isRead: true }))
 )
 setUnreadCount(0)
 socket?.emit('all-notifications-read')
 toast.success('All notifications marked as read')
 } catch (error) {
 console.error('Error marking all as read:', error)
 }
 }

 const getIcon = (type: string) => {
 switch (type) {
 case 'message': return '💬'
 case 'booking': return '📅'
 case 'review': return '⭐'
 default: return '🔔'
 }
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

 if (!user) return null

 return (
 <div className="relative" ref={dropdownRef}>
 <button
 id="notification-bell"
 onClick={() => setIsOpen(!isOpen)}
 className="relative text-gray-800 hover:text-white transition-colors p-2"
 >
 <FaBell className="text-xl" />
 {unreadCount > 0 && (
 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
 {unreadCount > 9 ? '9+' : unreadCount}
 </span>
 )}
 </button>

 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, y: -10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: -10, scale: 0.95 }}
 transition={{ duration: 0.2 }}
 className="absolute right-0 mt-2 w-80 md:w-96 max-h-96 glass rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
 >
 <div className="p-4 border-b border-gray-200 flex justify-between items-center">
 <h3 className="text-white font-semibold">Notifications</h3>
 <div className="flex items-center gap-3">
 {unreadCount > 0 && (
 <button
 onClick={markAllAsRead}
 className="text-xs text-[#14B8A6] hover:text-[#0D9488] transition-colors"
 >
 Mark all read
 </button>
 )}
 <button
 onClick={() => setIsOpen(false)}
 className="text-gray-600 hover:text-white transition-colors"
 >
 <FaTimes className="text-sm" />
 </button>
 </div>
 </div>

 <div className="overflow-y-auto max-h-72">
 {loading ? (
 <div className="p-4 text-center text-gray-600">
 <div className="spinner-sm mx-auto"></div>
 </div>
 ) : notifications.length === 0 ? (
 <div className="p-8 text-center text-gray-600">
 <div className="text-4xl mb-2">🔔</div>
 <p>No notifications yet</p>
 </div>
 ) : (
 notifications.map((notification) => (
 <Link
 key={notification.id}
 href={notification.link || '#'}
 onClick={() => {
 if (!notification.isRead) {
 markAsRead(notification.id)
 }
 setIsOpen(false)
 }}
 className={`block p-4 border-b border-gray-200 hover:bg-white transition-colors ${
 !notification.isRead ? 'bg-white' : ''
 }`}
 >
 <div className="flex items-start gap-3">
 <div className="text-2xl">{getIcon(notification.type)}</div>
 <div className="flex-1 min-w-0">
 <p className="text-sm text-white font-medium">
 {notification.title}
 </p>
 <p className="text-xs text-gray-600 truncate">
 {notification.content}
 </p>
 <p className="text-xs text-gray-500 mt-1">
 {getTimeAgo(notification.createdAt)}
 </p>
 </div>
 {!notification.isRead && (
 <div className="w-2 h-2 bg-[#14B8A6] rounded-full mt-1 flex-shrink-0"></div>
 )}
 </div>
 </Link>
 ))
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )
}