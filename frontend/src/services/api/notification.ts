import api from './api'

export interface Notification {
 id: string
 userId: string
 type: 'message' | 'booking' | 'review' | 'system'
 title: string
 content: string
 isRead: boolean
 link: string | null
 image: string | null
 createdAt: string
}

export const notificationService = {
 getNotifications: async () => {
 const response = await api.get('/notifications')
 return response.data
 },

 getUnreadCount: async () => {
 const response = await api.get('/notifications/unread/count')
 return response.data
 },

 markAsRead: async (id: string) => {
 const response = await api.put(`/notifications/${id}/read`)
 return response.data
 },

 markAllAsRead: async () => {
 const response = await api.put('/notifications/read-all')
 return response.data
 },
}