import api from './api'

export interface Product {
 id: string
 title: string
 description: string
 price: number
 category: string
 condition?: string
 images: string[]
 location?: string
 isAvailable: boolean
 userId: string
 user: {
 id: string
 fullName: string
 email: string
 }
 createdAt: string
}

export const productService = {
 getAll: async () => {
 const response = await api.get('/products')
 return response.data
 },

 getById: async (id: string) => {
 const response = await api.get('/products/' + id)
 return response.data
 },

 create: async (data: any) => {
 const response = await api.post('/products', data)
 return response.data
 },

 update: async (id: string, data: any) => {
 const response = await api.put('/products/' + id, data)
 return response.data
 },

 delete: async (id: string) => {
 const response = await api.delete('/products/' + id)
 return response.data
 },

 search: async (params: any) => {
 const response = await api.get('/products/search', { params })
 return response.data
 }
}
