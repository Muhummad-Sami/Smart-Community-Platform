import api from './api'

export interface RegisterData {
 email: string
 password: string
 fullName: string
 username?: string
}

export interface LoginData {
 email: string
 password: string
}

export interface User {
 id: string
 email: string
 fullName: string
 username: string
 profilePicture?: string
 bio?: string
 location?: string
 phone?: string
 skills?: string
 role: string
 isVerified: boolean
 createdAt: string
}

export const authService = {
 register: async (data: RegisterData) => {
 const response = await api.post('/auth/register', data)
 return response.data
 },

 login: async (data: LoginData) => {
 const response = await api.post('/auth/login', data)
 return response.data
 },

 getProfile: async () => {
 const response = await api.get('/auth/profile')
 return response.data
 },

 logout: () => {
 sessionStorage.removeItem('token') // Changed to sessionStorage
 sessionStorage.removeItem('user') // Changed to sessionStorage
 },
}
