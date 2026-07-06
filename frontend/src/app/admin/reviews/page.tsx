'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FaArrowLeft, FaStar, FaUser, FaClock, FaCheck, FaTimes, FaExclamationTriangle, FaFilter } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import api from '@/services/api/api'
import { StarRating } from '@/components/shared/StarRating'
import { AdminRoute } from '@/components/shared/AdminRoute'

export default function AdminReviewsPage() {
 const { user } = useAuth()
 const [reviews, setReviews] = useState<any[]>([])
 const [loading, setLoading] = useState(true)
 const [filter, setFilter] = useState<'all' | 'reported'>('all')

 useEffect(() => {
 if (user && user.role === 'ADMIN') {
 fetchReviews()
 }
 }, [user])

 const fetchReviews = async () => {
 try {
 const response = await api.get('/admin/reviews/all')
 setReviews(response.data.data)
 } catch (error) {
 console.error('Error fetching reviews:', error)
 toast.error('Failed to load reviews')
 setReviews([])
 } finally {
 setLoading(false)
 }
 }

 const reportReview = async (id: string) => {
 try {
 await api.put(`/reviews/${id}/report`)
 toast.success('Review reported successfully')
 fetchReviews()
 } catch (error) {
 console.error('Error reporting review:', error)
 toast.error('Failed to report review')
 }
 }

 const resolveReview = async (id: string, action: string) => {
 try {
 await api.put(`/admin/reviews/${id}/resolve`, { action })
 toast.success(`Review ${action === 'remove' ? 'removed' : 'kept'} successfully`)
 fetchReviews()
 } catch (error) {
 console.error('Error resolving review:', error)
 toast.error('Failed to resolve review')
 }
 }

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="spinner"></div>
 </div>
 )
 }

 const filteredReviews = filter === 'reported' 
 ? reviews.filter(r => r.isReported === true)
 : reviews

 const reportedCount = reviews.filter(r => r.isReported === true).length

 return (
 <AdminRoute>
 <div className="min-h-screen py-24 px-4 bg-gradient-to-b from-[#0f1629] to-[#0d1117]">
 <div className="container-custom max-w-5xl mx-auto">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
 <div>
 <Link href="/admin/dashboard" className="text-gray-600 hover:text-white transition-colors inline-flex items-center gap-2 mb-4 text-sm font-medium">
 <FaArrowLeft /> Back to Dashboard
 </Link>
 <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
 <FaStar className="text-[#14B8A6]" /> Review Moderation
 </h1>
 <p className="text-gray-600">Manage all reviews on the platform</p>
 </div>
 
 <div className="flex gap-4">
 <div className="card px-5 py-3 flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#34d399] flex items-center justify-center text-white text-lg shadow-lg">
 <FaStar />
 </div>
 <div>
 <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wider">All Reviews</p>
 <p className="text-xl font-bold text-white">{reviews.length}</p>
 </div>
 </div>
 <div className="card px-5 py-3 flex items-center gap-3 border border-red-500/20">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ef4444] to-[#f87171] flex items-center justify-center text-white text-lg shadow-lg">
 <FaExclamationTriangle />
 </div>
 <div>
 <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wider">Reported</p>
 <p className="text-xl font-bold text-white">{reportedCount}</p>
 </div>
 </div>
 </div>
 </div>

 <div className="card p-0 overflow-hidden flex flex-col">
 {/* Toolbar */}
 <div className="p-5 border-b border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center gap-4">
 <div className="flex gap-2 p-1 bg-white rounded-xl self-start">
 <button
 onClick={() => setFilter('all')}
 className={`px-5 py-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
 filter === 'all' ? 'bg-gray-100 text-white shadow-sm' : 'text-gray-600 hover:text-white hover:bg-white'
 }`}
 >
 <FaFilter className={filter === 'all' ? 'text-[#14B8A6]' : ''} /> All Reviews
 </button>
 <button
 onClick={() => setFilter('reported')}
 className={`px-5 py-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
 filter === 'reported' ? 'bg-red-500/10 text-red-400 shadow-sm border border-red-500/20' : 'text-gray-600 hover:text-white hover:bg-white'
 }`}
 >
 <FaExclamationTriangle className={filter === 'reported' ? 'text-red-400' : ''} /> Reported
 </button>
 </div>
 </div>

 {/* List */}
 <div className="p-6">
 {filteredReviews.length === 0 ? (
 <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
 {filter === 'reported' ? (
 <div key="empty-reported">
 <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
 <FaCheck className="text-4xl text-emerald-500" />
 </div>
 <h3 className="text-xl font-semibold text-white mb-2">No Reported Reviews</h3>
 <p className="text-gray-600">All reviews are clean!</p>
 </div>
 ) : (
 <div key="empty-all">
 <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center mx-auto mb-5">
 <FaStar className="text-4xl text-[#4b5e7a]" />
 </div>
 <h3 className="text-xl font-semibold text-white mb-2">No Reviews Yet</h3>
 <p className="text-gray-600">No reviews have been submitted yet.</p>
 </div>
 )}
 </div>
 ) : (
 <div className="space-y-4">
 {filteredReviews.map((review) => (
 <motion.div
 key={review.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className={`bg-white hover:bg-gray-100 transition-colors rounded-2xl p-6 border ${
 review.isReported ? 'border-red-500/30 shadow-lg' : 'border-gray-200'
 }`}
 >
 <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
 <div className="flex-1">
 <div className="flex items-center gap-4 mb-4">
 <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
 {review.reviewer?.fullName?.charAt(0) || 'U'}
 </div>
 <div>
 <p className="text-white font-semibold text-lg leading-tight mb-1">{review.reviewer?.fullName || 'Anonymous'}</p>
 <div className="bg-white px-2 py-1 rounded flex items-center w-fit">
 <StarRating rating={review.rating} readonly size="sm" />
 </div>
 </div>
 </div>
 
 {review.comment && (
 <div className="bg-primary-900 rounded-xl p-4 border border-gray-200 mb-4 relative before:absolute before:left-4 before:-top-2 before:w-4 before:h-4 before:bg-primary-900 before:border-t before:border-l before:border-gray-200 before:rotate-45">
 <p className="text-[#cbd5e1] text-sm leading-relaxed relative z-10">{review.comment}</p>
 </div>
 )}
 
 <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-[11px] font-medium text-gray-600 uppercase tracking-wider">
 {review.booking?.service?.title && (
 <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md">
 <span className="text-[#4b5e7a]">Service:</span>
 <span className="text-white normal-case truncate max-w-[200px]">{review.booking.service.title}</span>
 </span>
 )}
 <span className="flex items-center gap-1.5">
 <FaUser className="text-[#14B8A6]" />
 Reviewee: <span className="text-white normal-case">{review.reviewee?.fullName || 'Unknown'}</span>
 </span>
 <span className="flex items-center gap-1.5">
 <FaClock className="text-[#14B8A6]" />
 <span className="text-white normal-case">{new Date(review.createdAt).toLocaleDateString()}</span>
 </span>
 {review.isReported && (
 <span className="flex items-center gap-1.5 text-red-400 bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20">
 <FaExclamationTriangle />
 Reported
 </span>
 )}
 </div>
 </div>
 
 <div className="flex md:flex-col gap-2 shrink-0 md:w-32">
 {review.isReported ? (
 <>
 <button
 onClick={() => resolveReview(review.id, 'keep')}
 className="flex-1 md:w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
 >
 <FaCheck /> Keep
 </button>
 <button
 onClick={() => resolveReview(review.id, 'remove')}
 className="flex-1 md:w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
 >
 <FaTimes /> Remove
 </button>
 </>
 ) : (
 <button
 onClick={() => reportReview(review.id)}
 className="flex-1 md:w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
 >
 <FaExclamationTriangle /> Report
 </button>
 )}
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </AdminRoute>
 )
}