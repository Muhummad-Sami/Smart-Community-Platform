'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FaSave, FaTimes } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import api from '@/services/api/api'

export default function EditProfilePage() {
 const router = useRouter()
 const { user, updateUser } = useAuth()
 const [loading, setLoading] = useState(false)
 const [formData, setFormData] = useState({
 fullName: user?.fullName || '',
 bio: user?.bio || '',
 location: user?.location || '',
 phone: user?.phone || '',
 skills: user?.skills || '',
 })

 if (!user) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="text-center">
 <h2 className="text-2xl font-bold text-white mb-4">Please Login</h2>
 <Link href="/login" className="btn-primary">Go to Login</Link>
 </div>
 </div>
 )
 }

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 setLoading(true)
 try {
 const response = await api.put('/users/profile', formData)
 updateUser(response.data.data)
 toast.success('Profile updated successfully!')
 router.push('/profile')
 } catch (error: any) {
 toast.error(error.response?.data?.error || 'Failed to update profile')
 } finally {
 setLoading(false)
 }
 }

 return (
 <div className="min-h-screen py-20 px-4">
 <div className="container-custom max-w-2xl mx-auto">
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 >
 <div className="card p-8">
 <div className="flex justify-between items-center mb-6">
 <h1 className="text-2xl font-bold gradient-text">Edit Profile</h1>
 <Link href="/profile" className="text-gray-600 hover:text-white transition-colors">
 <FaTimes className="text-xl" />
 </Link>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-800 mb-2">
 Full Name
 </label>
 <input
 type="text"
 required
 value={formData.fullName}
 onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
 className="input-field"
 placeholder="Your full name"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-800 mb-2">
 Bio
 </label>
 <textarea
 rows={3}
 value={formData.bio}
 onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
 className="input-field"
 placeholder="Tell us about yourself..."
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-800 mb-2">
 Location
 </label>
 <input
 type="text"
 value={formData.location}
 onChange={(e) => setFormData({ ...formData, location: e.target.value })}
 className="input-field"
 placeholder="City, Country"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-800 mb-2">
 Phone Number
 </label>
 <input
 type="tel"
 value={formData.phone}
 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
 className="input-field"
 placeholder="+1 234 567 890"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-800 mb-2">
 Skills (comma separated)
 </label>
 <input
 type="text"
 value={formData.skills}
 onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
 className="input-field"
 placeholder="React, Node.js, Python"
 />
 </div>

 <div className="flex gap-3">
 <button
 type="submit"
 disabled={loading}
 className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
 >
 <FaSave />
 {loading ? 'Saving...' : 'Save Changes'}
 </button>
 <Link
 href="/profile"
 className="btn-secondary flex-1 py-3 flex items-center justify-center gap-2"
 >
 <FaTimes /> Cancel
 </Link>
 </div>
 </form>
 </div>
 </motion.div>
 </div>
 </div>
 )
}
