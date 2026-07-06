'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaStore } from 'react-icons/fa'

export default function LoginPage() {
  const router = useRouter()
  const { login, user, isAuthenticated } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') router.push('/admin/dashboard')
      else if (user.role === 'PROVIDER') router.push('/provider/dashboard')
      else router.push('/dashboard')
    }
  }, [isAuthenticated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(formData.email, formData.password)
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
      {/* Decorative blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary-700/30 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center shadow-lg">
            <FaStore className="text-primary-900 text-lg" />
          </div>
          <span className="text-2xl font-bold text-cream-100">SmartCommunity</span>
        </div>

        <div className="bg-cream-100 rounded-3xl p-8 md:p-10 shadow-2xl border border-primary-700/30">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-primary-800">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field pl-12"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field pl-12 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-900 transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-primary-800 cursor-pointer">
                <input type="checkbox" className="rounded border-border accent-primary-500" />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-primary-500 hover:text-primary-900 font-semibold transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="spinner-sm" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-primary-800">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary-500 hover:text-primary-900 font-semibold transition-colors">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}