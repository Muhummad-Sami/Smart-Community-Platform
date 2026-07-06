'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface AdminRouteProps {
 children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
 const { user, isLoading, isAuthenticated } = useAuth()
 const router = useRouter()

 useEffect(() => {
 if (!isLoading) {
 if (!isAuthenticated) {
 router.push('/login')
 return
 }

 if (user?.role !== 'ADMIN') {
 router.push('/dashboard')
 return
 }
 }
 }, [isLoading, isAuthenticated, user, router])

 if (isLoading) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="spinner"></div>
 </div>
 )
 }

 if (!isAuthenticated || user?.role !== 'ADMIN') {
 return null
 }

 return <>{children}</>
}