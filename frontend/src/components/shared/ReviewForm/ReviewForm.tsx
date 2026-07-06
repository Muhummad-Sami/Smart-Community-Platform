'use client'

import { useState } from 'react'
import { StarRating } from '../StarRating'
import { toast } from 'react-hot-toast'

interface ReviewFormProps {
 bookingId: string
 onSuccess?: () => void
 onCancel?: () => void
}

export function ReviewForm({ bookingId, onSuccess, onCancel }: ReviewFormProps) {
 const [rating, setRating] = useState(0)
 const [comment, setComment] = useState('')
 const [loading, setLoading] = useState(false)

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 if (rating === 0) {
 toast.error('Please select a rating')
 return
 }

 setLoading(true)
 try {
 // TODO: Implement review submission
 toast.success('Review submitted successfully!')
 if (onSuccess) onSuccess()
 } catch (error: any) {
 toast.error(error.response?.data?.error || 'Failed to submit review')
 } finally {
 setLoading(false)
 }
 }

 return (
 <div className="card p-6">
 <h3 className="text-lg font-semibold text-white mb-4">Write a Review</h3>
 
 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-800 mb-2">
 Your Rating *
 </label>
 <StarRating
 rating={rating}
 onRatingChange={setRating}
 size="lg"
 />
 {rating > 0 && (
 <p className="text-sm text-gray-600 mt-1">
 {rating === 5 && '⭐ Excellent!'}
 {rating === 4 && '👍 Good'}
 {rating === 3 && '👌 Average'}
 {rating === 2 && '😕 Below Average'}
 {rating === 1 && '😞 Poor'}
 </p>
 )}
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-800 mb-2">
 Your Review (Optional)
 </label>
 <textarea
 rows={3}
 value={comment}
 onChange={(e) => setComment(e.target.value)}
 className="input-field"
 placeholder="Share your experience..."
 />
 </div>

 <div className="flex gap-3">
 <button
 type="submit"
 disabled={loading || rating === 0}
 className="btn-primary flex-1 py-2"
 >
 {loading ? 'Submitting...' : 'Submit Review'}
 </button>
 {onCancel && (
 <button
 type="button"
 onClick={onCancel}
 className="btn-secondary py-2 px-4"
 >
 Cancel
 </button>
 )}
 </div>
 </form>
 </div>
 )
}