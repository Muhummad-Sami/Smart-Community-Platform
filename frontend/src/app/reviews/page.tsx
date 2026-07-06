'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FaClock, FaStar, FaUser } from 'react-icons/fa'
import { reviewService } from '@/services/api'
import { StarRating } from '@/components/shared/StarRating'

export default function ReviewsPage() {
 const { user } = useAuth()
 const [reviews, setReviews] = useState<any[]>([])
 const [loading, setLoading] = useState(true)
 const [averageRating, setAverageRating] = useState(0)
 const [totalReviews, setTotalReviews] = useState(0)
 const [viewType, setViewType] = useState<'received' | 'written'>('received')

 useEffect(() => {
 if (user) {
 fetchReviews()
 }
 }, [user, viewType])

 const fetchReviews = async () => {
 if (!user) return
 setLoading(true)
 try {
 let response
 if (viewType === 'received') {
 response = await reviewService.getUserReviews(user.id)
 } else {
 response = await reviewService.getReviewsWritten(user.id)
 }
 setReviews(response.data.reviews)
 setAverageRating(response.data.averageRating)
 setTotalReviews(response.data.totalReviews)
 } catch (error) {
 console.error('Error fetching reviews:', error)
 } finally {
 setLoading(false)
 }
 }

 if (!user) {
 return (
 <div className="min-h-screen flex items-center justify-center px-4">
 <div className="text-center">
 <h2 className="text-2xl font-bold text-white mb-4">Please Login</h2>
 <Link href="/login" className="btn-primary">Go to Login</Link>
 </div>
 </div>
 )
 }

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="spinner"></div>
 </div>
 )
 }

 const isProvider = user.role === 'PROVIDER'

 return (
 <div className="min-h-screen py-20 px-4">
 <div className="container-custom max-w-3xl mx-auto">
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 >
 <div className="flex items-center justify-between mb-6">
 <h1 className="text-3xl font-bold gradient-text">My Reviews</h1>
 <Link href={isProvider ? '/provider/dashboard' : '/dashboard'} className="text-gray-600 hover:text-white transition-colors">
 ← Back
 </Link>
 </div>

 {/* Tabs */}
 <div className="flex gap-4 mb-6">
 <button
 onClick={() => setViewType('received')}
 className={`px-6 py-2 rounded-xl transition-all duration-300 ${
 viewType === 'received' 
 ? 'btn-primary' 
 : 'glass text-gray-600 hover:text-white'
 }`}
 >
 Reviews Received
 </button>
 <button
 onClick={() => setViewType('written')}
 className={`px-6 py-2 rounded-xl transition-all duration-300 ${
 viewType === 'written' 
 ? 'btn-primary' 
 : 'glass text-gray-600 hover:text-white'
 }`}
 >
 Reviews Written
 </button>
 </div>

 {/* Rating Summary */}
 {reviews.length > 0 && (
 <div className="card p-6 mb-8">
 <div className="flex items-center gap-6">
 <div className="text-5xl font-bold gradient-text">
 {averageRating.toFixed(1)}
 </div>
 <div>
 <StarRating rating={Math.round(averageRating)} readonly size="lg" />
 <p className="text-gray-600 mt-1">
 Based on {totalReviews} review{totalReviews !== 1 && 's'}
 </p>
 </div>
 </div>
 </div>
 )}

 {/* Reviews List */}
 {reviews.length === 0 ? (
 <div className="card p-12 text-center">
 <div className="text-6xl mb-4">⭐</div>
 <h3 className="text-xl font-semibold text-white mb-2">
 {viewType === 'received' ? 'No Reviews Received Yet' : 'No Reviews Written Yet'}
 </h3>
 <p className="text-gray-600">
 {viewType === 'received' 
 ? 'Complete bookings to receive reviews from clients.'
 : 'Complete bookings and write reviews for services you\'ve used.'}
 </p>
 </div>
 ) : (
 <div className="space-y-4">
 {reviews.map((review) => (
 <motion.div
 key={review.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="card p-6"
 >
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
 {viewType === 'received' 
 ? review.reviewer?.fullName?.charAt(0) || 'U'
 : review.reviewee?.fullName?.charAt(0) || 'U'
 }
 </div>
 <div>
 <p className="text-white font-medium">
 {viewType === 'received' 
 ? review.reviewer?.fullName || 'Anonymous'
 : review.reviewee?.fullName || 'Anonymous'
 }
 </p>
 <StarRating rating={review.rating} readonly size="sm" />
 </div>
 </div>
 <div className="text-xs text-gray-600 flex items-center gap-1">
 <FaClock />
 {new Date(review.createdAt).toLocaleDateString()}
 </div>
 </div>
 {review.comment && (
 <p className="text-gray-800 mt-3">{review.comment}</p>
 )}
 {review.booking?.service?.title && (
 <p className="text-xs text-gray-500 mt-2">
 Service: {review.booking.service.title}
 </p>
 )}
 </motion.div>
 ))}
 </div>
 )}
 </motion.div>
 </div>
 </div>
 )
}