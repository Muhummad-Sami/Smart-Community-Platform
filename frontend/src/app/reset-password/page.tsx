'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import api from '@/services/api/api'
import { toast } from 'react-hot-toast'

export default function ResetPasswordPage() {
 const router = useRouter()
 const searchParams = useSearchParams()
 const token = searchParams.get('token')
 
 const [password, setPassword] = useState('')
 const [confirmPassword, setConfirmPassword] = useState('')
 const [showPassword, setShowPassword] = useState(false)
 const [loading, setLoading] = useState(false)
 const [success, setSuccess] = useState(false)

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 
 if (password !== confirmPassword) {
 toast.error('Passwords do not match')
 return
 }

 if (password.length < 6) {
 toast.error('Password must be at least 6 characters')
 return
 }

 setLoading(true)
 try {
 await api.post('/auth/reset-password', { token, newPassword: password })
 setSuccess(true)
 toast.success('Password reset successfully!')
 setTimeout(() => router.push('/login'), 3000)
 } catch (error: any) {
 toast.error(error.response?.data?.error || 'Something went wrong')
 } finally {
 setLoading(false)
 }
 }

 if (!token) {
 return (
 <div className="min-h-screen flex items-center justify-center px-4">
 <div className="glass rounded-3xl p-8 text-center max-w-md">
 <h2 className="text-2xl font-bold text-red-400 mb-4">Invalid Token</h2>
 <p className="text-gray-600 mb-6">No reset token provided.</p>
 <Link href="/forgot-password" className="btn-primary">
 Request New Reset
 </Link>
 </div>
 </div>
 )
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
 Reset Password
 </h1>
 <p className="text-gray-600">Enter your new password</p>
 </div>

 {success ? (
 <div className="text-center">
 <div className="glass p-6 rounded-xl mb-4">
 <p className="text-green-400 text-lg">? Password Reset Success!</p>
 <p className="text-gray-600 text-sm mt-2">Redirecting to login...</p>
 </div>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="space-y-6">
 <div>
 <label className="block text-sm font-medium text-gray-800 mb-2">
 New Password
 </label>
 <div className="relative">
 <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
 <input
 type={showPassword ? 'text' : 'password'}
 required
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="input-field pl-12 pr-12"
 placeholder="????????"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
 >
 {showPassword ? <FaEyeSlash /> : <FaEye />}
 </button>
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-800 mb-2">
 Confirm Password
 </label>
 <div className="relative">
 <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
 <input
 type={showPassword ? 'text' : 'password'}
 required
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 className="input-field pl-12"
 placeholder="????????"
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
 Resetting...
 </div>
 ) : (
 'Reset Password'
 )}
 </button>
 </form>
 )}
 </div>
 </motion.div>
 </div>
 )
}
