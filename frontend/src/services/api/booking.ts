import api from './api'

export const bookingService = {
 getMyBookings: async () => {
 const response = await api.get('/bookings/my')
 return response.data
 },

 getById: async (id: string) => {
 if (!id) {
 throw new Error('Booking ID is required')
 }
 const response = await api.get('/bookings/' + id)
 return response.data
 },

 create: async (data: { serviceId: string; dateTime: string; notes?: string }) => {
 if (!data.serviceId) {
 throw new Error('Service ID is required')
 }
 const response = await api.post('/bookings', data)
 return response.data
 },

 // ✅ Update booking status (for providers)
 updateStatus: async (id: string, status: string) => {
 if (!id) {
 throw new Error('Booking ID is required')
 }
 const response = await api.put('/bookings/' + id + '/status', { status })
 return response.data
 },

 cancel: async (id: string) => {
 if (!id) {
 throw new Error('Booking ID is required')
 }
 console.log('📤 Cancelling booking:', id)
 try {
 const response = await api.put('/bookings/' + id + '/cancel')
 console.log('📥 Cancel response:', response.data)
 return response.data
 } catch (error) {
 console.error('❌ Cancel API error:', error)
 throw error
 }
 },
}