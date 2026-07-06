'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '@/context/NotificationContext'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import {
 FaBell, FaCheckDouble, FaCalendarCheck, FaComments,
 FaStar, FaBox, FaShieldAlt, FaInfoCircle, FaTrash
} from 'react-icons/fa'

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
 booking: { icon: FaCalendarCheck, color: 'text-[#60a5fa]', bg: 'bg-[#14B8A6]/15' },
 message: { icon: FaComments, color: 'text-[#a78bfa]', bg: 'bg-[#14B8A6]/15' },
 review: { icon: FaStar, color: 'text-[#fbbf24]', bg: 'bg-[#d97706]/15' },
 listing: { icon: FaBox, color: 'text-[#34d399]', bg: 'bg-[#16a34a]/15' },
 system: { icon: FaShieldAlt, color: 'text-[#f87171]', bg: 'bg-[#ef4444]/15' },
 default: { icon: FaInfoCircle, color: 'text-gray-600', bg: 'bg-white/8' },
}

function timeAgo(dateStr: string) {
 const diff = Date.now() - new Date(dateStr).getTime()
 const m = Math.floor(diff / 60000)
 if (m < 1) return 'Just now'
 if (m < 60) return `${m}m ago`
 const h = Math.floor(m / 60)
 if (h < 24) return `${h}h ago`
 const d = Math.floor(h / 24)
 if (d < 7) return `${d}d ago`
 return new Date(dateStr).toLocaleDateString()
}

export default function NotificationsPage() {
 const { user } = useAuth()
 const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
 const [filter, setFilter] = useState<'all' | 'unread'>('all')

 if (!user) {
 return (
 <div className="min-h-screen flex items-center justify-center px-4">
 <div className="text-center">
 <FaBell className="text-5xl text-[#4b5e7a] mx-auto mb-4" />
 <h2 className="text-2xl font-bold text-white mb-3">Login Required</h2>
 <p className="text-gray-600 mb-6">Please login to view your notifications</p>
 <Link href="/login" className="btn-primary">Go to Login</Link>
 </div>
 </div>
 )
 }

 const filtered = filter === 'unread'
 ? notifications.filter(n => !n.isRead)
 : notifications

 return (
 <div className="min-h-screen py-24 px-4">
 <div className="container-custom max-w-3xl">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex items-center justify-between mb-8"
 >
 <div>
 <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-1">Notifications</h1>
 <p className="text-gray-600 text-sm">
 {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
 </p>
 </div>
 {unreadCount > 0 && (
 <button
 onClick={markAllAsRead}
 className="btn-secondary flex items-center gap-2 text-sm"
 >
 <FaCheckDouble className="text-[#60a5fa] text-xs" />
 Mark all read
 </button>
 )}
 </motion.div>

 {/* Filter Tabs */}
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.05 }}
 className="flex gap-2 mb-6"
 >
 {(['all', 'unread'] as const).map(f => (
 <button
 key={f}
 onClick={() => setFilter(f)}
 className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
 filter === f
 ? 'bg-[#14B8A6] text-white shadow-lg'
 : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-white'
 }`}
 >
 {f === 'all' ? 'All' : `Unread ${unreadCount > 0 ? `(${unreadCount})` : ''}`}
 </button>
 ))}
 </motion.div>

 {/* Notification List */}
 <div className="space-y-2">
 <AnimatePresence mode="popLayout">
 {filtered.length === 0 ? (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="glass rounded-2xl py-16 text-center"
 >
 <FaBell className="text-5xl text-[#4b5e7a] mx-auto mb-4" />
 <h3 className="text-lg font-semibold text-white mb-2">
 {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
 </h3>
 <p className="text-gray-600 text-sm">
 {filter === 'unread' ? 'Switch to "All" to see past notifications' : "You'll see activity here when things happen"}
 </p>
 </motion.div>
 ) : (
 filtered.map((n, i) => {
 const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.default
 const Icon = config.icon
 return (
 <motion.div
 key={n.id}
 layout
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, x: -20 }}
 transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.2) }}
 className={`glass rounded-2xl p-4 flex items-start gap-4 cursor-pointer hover:bg-white transition-all duration-200 ${
 !n.isRead ? 'border-l-2 border-[#14B8A6]' : ''
 }`}
 onClick={() => { if (!n.isRead) markAsRead(n.id) }}
 >
 {/* Icon */}
 <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
 <Icon className={`${config.color} text-sm`} />
 </div>

 {/* Content */}
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className={`text-sm font-semibold leading-tight ${!n.isRead ? 'text-white' : 'text-gray-600'}`}>
 {n.title}
 </p>
 <p className="text-xs text-[#4b5e7a] mt-0.5 leading-relaxed">{n.content}</p>
 </div>
 <div className="flex items-center gap-2 flex-shrink-0">
 {!n.isRead && (
 <div className="w-2 h-2 rounded-full bg-[#14B8A6] flex-shrink-0" />
 )}
 <span className="text-xs text-[#4b5e7a] whitespace-nowrap">{timeAgo(n.createdAt)}</span>
 </div>
 </div>
 {n.link && (
 <Link
 href={n.link}
 onClick={e => e.stopPropagation()}
 className="inline-flex items-center gap-1 text-xs text-[#60a5fa] hover:text-[#a78bfa] transition-colors mt-2"
 >
 View details →
 </Link>
 )}
 </div>
 </motion.div>
 )
 })
 )}
 </AnimatePresence>
 </div>
 </div>
 </div>
 )
}
