'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaUserTie, FaUserPlus, FaStore } from 'react-icons/fa'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('USER')
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '', username: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register({ ...formData, role: selectedRole })
      router.push('/dashboard')
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
      {/* Decorative blobs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/30 rounded-full blur-3xl pointer-events-none" />

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
              Create Account
            </h1>
            <p className="text-primary-800">Choose your role and join the community</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setSelectedRole('USER')}
              className={`p-4 rounded-xl transition-all duration-300 border-2 text-left ${
                selectedRole === 'USER'
                  ? 'bg-primary-500/10 border-primary-500 shadow-md'
                  : 'bg-surface border-border hover:border-primary-400'
              }`}
            >
              <FaUserPlus className={`text-2xl mb-2 ${selectedRole === 'USER' ? 'text-primary-500' : 'text-primary-700'}`} />
              <p className="text-sm font-bold text-primary-900">Client</p>
              <p className="text-xs text-primary-800">Book services</p>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('PROVIDER')}
              className={`p-4 rounded-xl transition-all duration-300 border-2 text-left ${
                selectedRole === 'PROVIDER'
                  ? 'bg-primary-500/10 border-primary-500 shadow-md'
                  : 'bg-surface border-border hover:border-primary-400'
              }`}
            >
              <FaUserTie className={`text-2xl mb-2 ${selectedRole === 'PROVIDER' ? 'text-primary-500' : 'text-primary-700'}`} />
              <p className="text-sm font-bold text-primary-900">Provider</p>
              <p className="text-xs text-primary-800">Offer services</p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="input-field pl-12"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Email Address</label>
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
              <label className="block text-sm font-semibold text-primary-900 mb-2">Username</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input-field pl-12"
                  placeholder="johndoe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Password</label>
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="spinner-sm" />
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-primary-800">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-500 hover:text-primary-900 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}