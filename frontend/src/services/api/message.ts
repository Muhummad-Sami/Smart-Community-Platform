// frontend/src/services/api/message.ts

import api from './api'

export interface Message {
 id: string
 tempId?: string // ✅ Add tempId for optimistic updates
 content: string
 senderId: string
 receiverId: string
 isRead: boolean
 readAt: string | null
 attachment: string | null
 createdAt: string
 delivered?: boolean
 status?: 'sending' | 'delivered' | 'read' | 'failed' // ✅ Add status
 sender: {
 id: string
 fullName: string
 profilePicture: string | null
 }
 receiver: {
 id: string
 fullName: string
 profilePicture: string | null
 }
}

export interface Conversation {
 user: {
 id: string
 fullName: string
 profilePicture: string | null
 email: string
 }
 lastMessage: Message | null
 unreadCount: number
}

export const messageService = {
 getConversations: async () => {
 const response = await api.get('/messages/conversations')
 return response.data
 },

 getConversation: async (userId: string) => {
 const response = await api.get(`/messages/conversation/${userId}`)
 return response.data
 },

 getMessages: async (userId: string) => {
 const response = await api.get(`/messages/${userId}`)
 return response.data
 },

 markAsRead: async (senderId: string) => {
 const response = await api.put(`/messages/read/${senderId}`)
 return response.data
 },

 // ✅ Add send message method
 sendMessage: async (data: { receiverId: string; content: string }) => {
 const response = await api.post('/messages', data)
 return response.data
 }
}