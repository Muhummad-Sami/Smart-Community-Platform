'use client'

import { useState, useEffect } from 'react'
import { StarRating } from '@/components/shared/StarRating'
import { FaUser, FaClock } from 'react-icons/fa'
import { reviewService } from '@/services/api'

interface ReviewListProps {
 userId: string
}

export function ReviewList({ userId }: ReviewListProps) {
 const [reviews, setReviews] = useState<any[]>([])
 const [loading, setLoading] = useState(true)
 const [averageRating, setAverageRating] = useState(0)
 const [totalReviews, setTotalReviews] = useState(0)

 useEffect(() => {
 fetchReviews()
 }, [userId])

 const fetchReviews = async () => {
 try {
 const response = await reviewService.getUserReviews(userId)
 setReviews(response.data.reviews)
 setAverageRating(response.data.averageRating)
 setTotalReviews(response.data.totalReviews)
 } catch (error) {
 console.error('Error fetching reviews:', error)
 } finally {
 setLoading(false)
 }
 }

 if (loading) {
 return (
 <div className="flex justify-center py-8">
 <div className="spinner-sm"></div>
 </div>
 )
 }

 if (reviews.length === 0) {
 return (
 <div className="text-center py-8 text-gray-600">
 <p className="text-lg">No reviews yet</p>
 <p className="text-sm mt-1">Be the first to leave a review!</p>
 </div>
 )
 }

 return (
 <div>
 {/* Summary */}
 <div className="flex items-center gap-4 mb-6 p-4 glass rounded-xl">
 <div className="text-4xl font-bold gradient-text">
 {averageRating.toFixed(1)}
 </div>
 <div>
 <StarRating rating={Math.round(averageRating)} readonly />
 <p className="text-sm text-gray-600 mt-1">
 Based on {totalReviews} review{totalReviews !== 1 && 's'}
 </p>
 </div>
 </div>

 {/* Reviews List */}
 <div className="space-y-4">
 {reviews.map((review) => (
 <div key={review.id} className="card p-4">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm">
 {review.reviewer?.fullName?.charAt(0) || 'U'}
 </div>
 <div>
 <p className="text-white font-medium">{review.reviewer?.fullName || 'Anonymous'}</p>
 <StarRating rating={review.rating} readonly size="sm" />
 </div>
 </div>
 <div className="text-xs text-gray-600 flex items-center gap-1">
 <FaClock />
 {new Date(review.createdAt).toLocaleDateString()}
 </div>
 </div>
 
 {review.comment && (
 <p className="text-gray-800 mt-3 text-sm">{review.comment}</p>
 )}

 {review.booking?.service?.title && (
 <p className="text-xs text-gray-500 mt-2">
 Service: {review.booking.service.title}
 </p>
 )}
 </div>
 ))}
 </div>
 </div>
 )
}
