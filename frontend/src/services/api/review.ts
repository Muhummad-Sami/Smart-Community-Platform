import api from './api'

export interface Review {
 id: string
 rating: number
 comment: string
 reviewerId: string
 revieweeId: string
 bookingId: string
 isReported: boolean
 createdAt: string
 reviewer: {
 id: string
 fullName: string
 profilePicture: string
 }
 reviewee: {
 id: string
 fullName: string
 profilePicture: string
 }
 booking: {
 id: string
 service: {
 title: string
 }
 }
}

export const reviewService = {
 create: async (data: { bookingId: string; rating: number; comment?: string }) => {
 const response = await api.post('/reviews', data)
 return response.data
 },

 getUserReviews: async (userId: string) => {
 const response = await api.get('/reviews/user/' + userId)
 return response.data
 },

 // ✅ ADD THIS NEW FUNCTION
 getReviewsWritten: async (userId: string) => {
 const response = await api.get('/reviews/written/' + userId)
 return response.data
 },

 getBookingsToReview: async () => {
 const response = await api.get('/reviews/my-bookings')
 return response.data
 },

 report: async (id: string) => {
 const response = await api.put('/reviews/' + id + '/report')
 return response.data
 },
}