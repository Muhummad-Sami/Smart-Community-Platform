'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FaEnvelope } from 'react-icons/fa'
import api from '@/services/api/api'
import { toast } from 'react-hot-toast'

export default function ForgotPasswordPage() {
 const [email, setEmail] = useState('')
 const [loading, setLoading] = useState(false)
 const [sent, setSent] = useState(false)

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 setLoading(true)
 try {
 await api.post('/auth/forgot-password', { email })
 setSent(true)
 toast.success('Reset link sent to your email!')
 } catch (error: any) {
 toast.error(error.response?.data?.error || 'Something went wrong')
 } finally {
 setLoading(false)
 }
 }

 return (
 <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0f1629] to-[#1a1a2e]" />
 
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 className="relative z-10 w-full max-w-md"
 >
 <div className="glass rounded-3xl p-8 md:p-10">
 <div className="text-center mb-8">
 <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
 Forgot Password
 </h1>
 <p className="text-gray-600">
 Enter your email to receive a reset link
 </p>
 </div>

 {sent ? (
 <div className="text-center">
 <div className="glass p-6 rounded-xl mb-4">
 <p className="text-green-400">? Check your email!</p>
 <p className="text-gray-600 text-sm mt-2">
 We've sent a password reset link to {email}
 </p>
 </div>
 <Link href="/login" className="btn-primary w-full block text-center">
 Back to Login
 </Link>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="space-y-6">
 <div>
 <label className="block text-sm font-medium text-gray-800 mb-2">
 Email Address
 </label>
 <div className="relative">
 <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
 <input
 type="email"
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="input-field pl-12"
 placeholder="you@example.com"
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="btn-primary w-full py-4 text-lg"
 >
 {loading ? (
 <div className="flex items-center justify-center gap-3">
 <div className="spinner-sm" />
 Sending...
 </div>
 ) : (
 'Send Reset Link'
 )}
 </button>

 <div className="text-center">
 <Link href="/login" className="text-[#14B8A6] hover:text-[#0D9488] transition-colors text-sm">
 Back to Login
 </Link>
 </div>
 </form>
 )}
 </div>
 </motion.div>
 </div>
 )
}
