'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface ProtectedRouteProps {
 children: React.ReactNode
 requiredRole?: 'ADMIN' | 'PROVIDER' | 'USER'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
 const { user, isLoading, isAuthenticated } = useAuth()
 const router = useRouter()

 useEffect(() => {
 if (!isLoading) {
 if (!isAuthenticated) {
 router.push('/login')
 return
 }

 if (requiredRole && user?.role !== requiredRole) {
 if (user?.role === 'ADMIN') {
 router.push('/admin/dashboard')
 } else if (user?.role === 'PROVIDER') {
 router.push('/provider/dashboard')
 } else {
 router.push('/dashboard')
 }
 return
 }
 }
 }, [isLoading, isAuthenticated, user, router, requiredRole])

 if (isLoading) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="spinner"></div>
 </div>
 )
 }

 if (!isAuthenticated) {
 return null
 }

 if (requiredRole && user?.role !== requiredRole) {
 return null
 }

 return <>{children}</>
}