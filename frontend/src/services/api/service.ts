import api from './api'

export interface Service {
 id: string
 title: string
 description: string
 price: number
 category: string
 deliveryTime?: string
 availability: boolean
 portfolioImages: string[]
 userId: string
 user: {
 id: string
 fullName: string
 email: string
 profilePicture?: string
 }
 createdAt: string
}

export const serviceService = {
 getAll: async () => {
 const response = await api.get('/services')
 return response.data
 },

 getById: async (id: string) => {
 const response = await api.get('/services/' + id)
 return response.data
 },

 create: async (data: any) => {
 const response = await api.post('/services', data)
 return response.data
 },

 update: async (id: string, data: any) => {
 const response = await api.put('/services/' + id, data)
 return response.data
 },

 delete: async (id: string) => {
 const response = await api.delete('/services/' + id)
 return response.data
 },

 search: async (params: any) => {
 const response = await api.get('/services/search', { params })
 return response.data
 },

 getByCategory: async (category: string) => {
 const response = await api.get('/services/category/' + category)
 return response.data
 }
}
