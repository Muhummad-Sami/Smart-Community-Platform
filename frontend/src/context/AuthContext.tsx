'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService, User } from '@/services/api'
import { toast } from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
  updateUser: (userData: User) => void
  isAuthenticated: boolean
  refreshUser: () => Promise<void> // ✅ Add this
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = sessionStorage.getItem('token')
        const storedUser = sessionStorage.getItem('user')
        
        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          console.log('✅ User restored:', parsedUser.email)
          console.log('✅ Role:', parsedUser.role)
        } else {
          console.log('ℹ️ No session found')
        }
      } catch (error) {
        console.error('Error restoring session:', error)
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Logging in...', email)
      const response = await authService.login({ email, password })
      const { user, token } = response.data
      
      console.log('📋 User role from backend:', user.role)
      
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      console.log('✅ Login successful:', user.email)
      console.log('✅ Role:', user.role)
      toast.success(`Welcome ${user.fullName}!`)
    } catch (error: any) {
      console.error('❌ Login error:', error)
      toast.error(error.response?.data?.error || 'Login failed')
      throw error
    }
  }

  const register = async (data: any) => {
    try {
      console.log('📝 Registering...', data.email)
      const response = await authService.register(data)
      const { user, token } = response.data
      
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      console.log('✅ Registration successful:', user.email)
      toast.success('Registration successful!')
    } catch (error: any) {
      console.error('❌ Registration error:', error)
      toast.error(error.response?.data?.error || 'Registration failed')
      throw error
    }
  }

  // ✅ Add this function to refresh user data from backend
  const refreshUser = async () => {
    try {
      const response = await authService.getProfile()
      if (response.success && response.data) {
        const updatedUser = response.data
        sessionStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        console.log('✅ User refreshed:', updatedUser.email)
        console.log('✅ Role:', updatedUser.role)
        return updatedUser
      }
    } catch (error) {
      console.error('❌ Failed to refresh user:', error)
    }
  }

  const updateUser = (userData: User) => {
    setUser(userData)
    sessionStorage.setItem('user', JSON.stringify(userData))
    console.log('✅ User updated:', userData.email)
  }

  const logout = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    setUser(null)
    console.log('👋 Logged out')
    toast.success('Logged out successfully')
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
        refreshUser, // ✅ Add this
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}