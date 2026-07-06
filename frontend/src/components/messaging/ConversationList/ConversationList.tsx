'use client'

import { useState } from 'react'
import { FaSearch, FaComments } from 'react-icons/fa'
import { Conversation } from '@/services/api/message'

interface ConversationListProps {
 conversations: Conversation[]
 selectedUserId: string | null
 onSelectUser: (userId: string) => void
 onlineUsers: string[]
 loading?: boolean
}

export function ConversationList({
 conversations,
 selectedUserId,
 onSelectUser,
 onlineUsers,
 loading,
}: ConversationListProps) {
 const [searchTerm, setSearchTerm] = useState('')

 const filteredConversations = conversations.filter((conv) =>
 conv.user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
 )

 const getTime = (date: string) => {
 return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
 }

 if (loading) {
 return (
 <div className="flex justify-center py-8">
 <div className="spinner-sm"></div>
 </div>
 )
 }

 return (
 <div className="flex flex-col h-full">
 <div className="mb-4">
 <div className="relative">
 <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
 <input
 type="text"
 placeholder="Search conversations..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="input-field pl-10 py-2"
 />
 </div>
 </div>

 <div className="flex-1 overflow-y-auto space-y-2">
 {filteredConversations.length === 0 ? (
 <div className="text-center text-gray-600 py-8">
 <FaComments className="text-4xl mx-auto mb-3 text-gray-600" />
 <p>No conversations yet</p>
 <p className="text-sm mt-2">Start messaging someone!</p>
 </div>
 ) : (
 filteredConversations.map((conv) => (
 <button
 key={conv.user.id}
 onClick={() => onSelectUser(conv.user.id)}
 className={`w-full p-3 rounded-xl transition-all duration-300 text-left ${
 selectedUserId === conv.user.id
 ? 'glass border border-[#14B8A6]'
 : 'hover:bg-white'
 }`}
 >
 <div className="flex items-center gap-3">
 <div className="relative flex-shrink-0">
 <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm">
 {conv.user.fullName?.charAt(0) || 'U'}
 </div>
 {onlineUsers.includes(conv.user.id) && (
 <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-dark"></div>
 )}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex justify-between items-start">
 <p className="text-white font-medium truncate text-sm">
 {conv.user.fullName}
 </p>
 {conv.lastMessage && (
 <span className="text-xs text-gray-600 flex-shrink-0 ml-2">
 {getTime(conv.lastMessage.createdAt)}
 </span>
 )}
 </div>
 <div className="flex justify-between items-center">
 <p className="text-sm text-gray-600 truncate">
 {conv.lastMessage?.content || 'No messages yet'}
 </p>
 {conv.unreadCount > 0 && (
 <span className="bg-[#14B8A6] text-white text-xs rounded-full px-2 py-0.5 flex-shrink-0 ml-2">
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
 )
}