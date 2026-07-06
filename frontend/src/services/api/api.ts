import axios from 'axios'
import { toast } from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
 baseURL: API_URL,
 headers: {
 'Content-Type': 'application/json',
 },
 withCredentials: true,
})

// Request interceptor - add token
api.interceptors.request.use(
 (config) => {
 const token = sessionStorage.getItem('token')
 if (token) {
 config.headers.Authorization = 'Bearer ' + token
 }
 // Ensure URL is a string
 if (config.url && typeof config.url !== 'string') {
 config.url = String(config.url)
 }
 return config
 },
 (error) => Promise.reject(error)
)

// Response interceptor - handle errors
api.interceptors.response.use(
 (response) => response,
 (error) => {
 if (error.response?.status === 401) {
 sessionStorage.removeItem('token')
 sessionStorage.removeItem('user')
 if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
 window.location.href = '/login'
 }
 toast.error('Session expired. Please login again.')
 }
 return Promise.reject(error)
 }
)

export default api