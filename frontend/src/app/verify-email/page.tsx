'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import api from '@/services/api/api'

export default function VerifyEmailPage() {
 const router = useRouter()
 const searchParams = useSearchParams()
 const token = searchParams.get('token')
 
 const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
 const [message, setMessage] = useState('')

 useEffect(() => {
 if (!token) {
 setStatus('error')
 setMessage('No verification token provided')
 return
 }

 const verifyEmail = async () => {
 try {
 const response = await api.get(`/auth/verify-email?token=${token}`)
 setStatus('success')
 setMessage(response.data.message)
 setTimeout(() => router.push('/login'), 3000)
 } catch (error: any) {
 setStatus('error')
 setMessage(error.response?.data?.error || 'Verification failed')
 }
 }

 verifyEmail()
 }, [token, router])

 return (
 <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0f1629] to-[#1a1a2e]" />
 
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 className="relative z-10 w-full max-w-md"
 >
 <div className="glass rounded-3xl p-8 md:p-10 text-center">
 {status === 'loading' && (
 <>
 <div className="spinner mx-auto mb-4"></div>
 <h2 className="text-2xl font-bold gradient-text">Verifying...</h2>
 <p className="text-gray-600 mt-2">Please wait while we verify your email</p>
 </>
 )}

 {status === 'success' && (
 <>
 <div className="text-6xl mb-4">?</div>
 <h2 className="text-2xl font-bold text-green-400">Email Verified!</h2>
 <p className="text-gray-600 mt-2">{message}</p>
 <p className="text-gray-600 text-sm mt-4">Redirecting to login...</p>
 <Link href="/login" className="btn-primary mt-6 inline-block">
 Go to Login
 </Link>
 </>
 )}

 {status === 'error' && (
 <>
 <div className="text-6xl mb-4">?</div>
 <h2 className="text-2xl font-bold text-red-400">Verification Failed</h2>
 <p className="text-gray-600 mt-2">{message}</p>
 <Link href="/login" className="btn-primary mt-6 inline-block">
 Back to Login
 </Link>
 </>
 )}
 </div>
 </motion.div>
 </div>
 )
}
