'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
 FaArrowLeft, FaUser, FaClock, FaCalendarCheck, 
 FaTimesCircle, FaStar, FaTimes, FaCheckCircle, FaCreditCard 
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { bookingService } from '@/services/api'
import { reviewService } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { StarRating } from '@/components/shared/StarRating'

export default function BookingDetailPage() {
 const params = useParams()
 const router = useRouter()
 const { user } = useAuth()
 const [booking, setBooking] = useState<any>(null)
 const [loading, setLoading] = useState(true)
 const [showReviewForm, setShowReviewForm] = useState(false)
 const [reviewRating, setReviewRating] = useState(0)
 const [reviewComment, setReviewComment] = useState('')
 const [submittingReview, setSubmittingReview] = useState(false)
 const [reviewSubmitted, setReviewSubmitted] = useState(false)
 const [showCancelModal, setShowCancelModal] = useState(false)
 const [cancelling, setCancelling] = useState(false)
 const [completing, setCompleting] = useState(false)

 const bookingId = params?.id as string

 useEffect(() => {
 if (bookingId) {
 fetchBooking()
 }
 }, [bookingId])

 const fetchBooking = async () => {
 try {
 const response = await bookingService.getById(bookingId)
 setBooking(response.data)
 if (response.data.review) {
 setReviewSubmitted(true)
 }
 } catch (error) {
 console.error('Error fetching booking:', error)
 toast.error('Booking not found')
 router.push('/bookings')
 } finally {
 setLoading(false)
 }
 }

 const handleCompleteBooking = async () => {
    setCompleting(true)
    try {
      await bookingService.updateStatus(booking.id, 'COMPLETED')
      toast.success('Booking marked as completed!')
      fetchBooking()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to complete booking')
    } finally {
      setCompleting(false)
    }
  }

  const updateBookingStatus = async (status: string) => {
    try {
      await bookingService.updateStatus(booking.id, status)
      toast.success(`Booking ${status.toLowerCase()} successfully!`)
      fetchBooking()
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to update status`)
    }
  }

 const handleCancelBooking = async () => {
 setCancelling(true)
 try {
 await bookingService.cancel(booking.id)
 toast.success('Booking cancelled successfully!')
 setShowCancelModal(false)
 fetchBooking()
 } catch (error: any) {
 toast.error(error.response?.data?.error || 'Failed to cancel booking')
 } finally {
 setCancelling(false)
 }
 }

 const handleReviewSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 if (reviewRating === 0) {
 toast.error('Please select a rating')
 return
 }

 setSubmittingReview(true)
 try {
 await reviewService.create({
 bookingId: booking.id,
 rating: reviewRating,
 comment: reviewComment.trim() || undefined,
 })
 toast.success('Review submitted successfully!')
 setReviewSubmitted(true)
 setShowReviewForm(false)
 fetchBooking()
 } catch (error: any) {
 toast.error(error.response?.data?.error || 'Failed to submit review')
 } finally {
 setSubmittingReview(false)
 }
 }

 const getStatusBadge = (status: string) => {
 const badges: Record<string, string> = {
 PENDING: 'badge-warning',
 ACCEPTED: 'badge-success',
 REJECTED: 'badge-danger',
 COMPLETED: 'badge-primary',
 CANCELLED: 'badge-danger',
 }
 return badges[status] || 'badge-secondary'
 }

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="spinner"></div>
 </div>
 )
 }

 if (!booking) {
 return (
 <div className="min-h-screen flex items-center justify-center px-4">
 <div className="text-center">
 <div className="text-6xl mb-4">📋</div>
 <h2 className="text-2xl font-bold text-white mb-4">Booking Not Found</h2>
 <Link href="/bookings" className="btn-primary">Back to Bookings</Link>
 </div>
 </div>
 )
 }

 // ✅ ROLE-BASED PERMISSIONS
 const isProvider = user?.id === booking.providerId
 const isClient = user?.id === booking.clientId

 // ✅ Provider permissions
 const canAccept = isProvider && booking.status === 'PENDING'
 const canReject = isProvider && booking.status === 'PENDING'
 const canComplete = isProvider && booking.status === 'ACCEPTED'

 // ✅ Client can cancel booking (only when PENDING)
 const canCancel = isClient && booking.status === 'PENDING'

 // ✅ Client can review after completion
 const canReview = isClient && booking.status === 'COMPLETED' && !reviewSubmitted

 return (
 <div className="min-h-screen py-20 px-4">
 <div className="container-custom max-w-4xl mx-auto">
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 >
 <Link href="/bookings" className="inline-flex items-center gap-2 text-gray-600 hover:text-white transition-colors mb-6">
 <FaArrowLeft /> Back to Bookings
 </Link>

 <div className="card p-8">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <h1 className="text-3xl font-bold gradient-text">Booking Details</h1>
 <span className={'badge ' + getStatusBadge(booking.status) + ' text-lg px-4 py-2'}>
 {booking.status}
 </span>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
 <div className="p-4 glass rounded-xl">
 <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Service</h3>
 <p className="text-white text-lg mt-1">{booking.service?.title || 'Unknown'}</p>
 <p className="text-gray-600 text-sm mt-1">Category: {booking.service?.category || 'N/A'}</p>
 </div>

 <div className="p-4 glass rounded-xl">
 <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Amount</h3>
 <p className="text-3xl font-bold gradient-text mt-1">${booking.totalAmount || 0}</p>
 </div>

 <div className="p-4 glass rounded-xl">
 <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Date & Time</h3>
 <p className="text-white text-lg mt-1 flex items-center gap-2">
 <FaClock className="text-[#14B8A6]" />
 {booking.dateTime ? new Date(booking.dateTime).toLocaleDateString() : 'N/A'}
 </p>
 <p className="text-gray-600 text-sm mt-1">
 {booking.dateTime ? new Date(booking.dateTime).toLocaleTimeString() : 'N/A'}
 </p>
 </div>

 <div className="p-4 glass rounded-xl">
 <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Provider</h3>
 <div className="flex items-center gap-3 mt-1">
 <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
 {booking.provider?.fullName?.charAt(0) || 'P'}
 </div>
 <div>
 <p className="text-white">{booking.provider?.fullName || 'Unknown'}</p>
 <p className="text-gray-600 text-sm">{booking.provider?.email || ''}</p>
 </div>
 </div>
 </div>
 </div>

 {booking.notes && (
 <div className="mt-6 p-4 glass rounded-xl">
 <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Notes</h3>
 <p className="text-white mt-1">{booking.notes}</p>
 </div>
 )}

 {/* ✅ ROLE-BASED ACTION BUTTONS */}
 <div className="mt-6 flex flex-wrap gap-3">
    
    {/* Provider: Accept Booking Button */}
    {canAccept && (
      <button
        onClick={() => updateBookingStatus('ACCEPTED')}
        className="btn-primary flex-1 py-3 text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 border-none shadow-lg"
      >
        <FaCheckCircle /> Accept Booking
      </button>
    )}

    {/* Provider: Reject Booking Button */}
    {canReject && (
      <button
        onClick={() => updateBookingStatus('REJECTED')}
        className="btn-danger flex-1 py-3 text-lg flex items-center justify-center gap-2"
      >
        <FaTimesCircle /> Reject
      </button>
    )}

    {/* Provider: Complete Booking Button */}
    {canComplete && (
      <button
        onClick={handleCompleteBooking}
        disabled={completing}
        className="btn-success flex-1 py-3 text-lg flex items-center justify-center gap-2"
      >
        <FaCheckCircle /> {completing ? 'Completing...' : 'Mark as Completed'}
      </button>
    )}
            {/* Client: Pay Now Button */}
            {isClient && booking.status === 'ACCEPTED' && (
              <Link 
                href={`/payment/${booking.id}`}
                className="btn-primary flex-1 py-3 text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 border-none shadow-lg"
              >
                <FaCreditCard /> Pay Now
              </Link>
            )}

            {/* Client: Cancel Booking Button */}
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="btn-danger flex-1 py-3 text-lg flex items-center justify-center gap-2"
              >
                <FaTimesCircle /> Cancel Booking
              </button>
            )}

 {/* Client: Write Review Button */}
 {canReview && (
 <button
 onClick={() => setShowReviewForm(true)}
 className="btn-primary flex-1 py-3 text-lg flex items-center justify-center gap-2"
 >
 <FaStar /> Write a Review
 </button>
 )}

 {/* Review Submitted Message */}
 {reviewSubmitted && (
 <div className="w-full p-4 glass rounded-xl text-center">
 <p className="text-green-400">✅ Thank you for your review!</p>
 </div>
 )}
 </div>

 {/* Review Form */}
 {showReviewForm && (
 <div className="mt-6 card p-6">
 <h3 className="text-lg font-semibold text-white mb-4">Write a Review</h3>
 
 <form onSubmit={handleReviewSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-800 mb-2">
 Your Rating *
 </label>
 <StarRating
 rating={reviewRating}
 onRatingChange={setReviewRating}
 size="lg"
 />
 {reviewRating > 0 && (
 <p className="text-sm text-gray-600 mt-1">
 {reviewRating === 5 && '⭐ Excellent!'}
 {reviewRating === 4 && '👍 Good'}
 {reviewRating === 3 && '👌 Average'}
 {reviewRating === 2 && '😕 Below Average'}
 {reviewRating === 1 && '😞 Poor'}
 </p>
 )}
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-800 mb-2">
 Your Review (Optional)
 </label>
 <textarea
 rows={3}
 value={reviewComment}
 onChange={(e) => setReviewComment(e.target.value)}
 className="input-field"
 placeholder="Share your experience with this service..."
 />
 </div>

 <div className="flex gap-3">
 <button
 type="submit"
 disabled={submittingReview || reviewRating === 0}
 className="btn-primary flex-1 py-2"
 >
 {submittingReview ? 'Submitting...' : 'Submit Review'}
 </button>
 <button
 type="button"
 onClick={() => setShowReviewForm(false)}
 className="btn-secondary py-2 px-4"
 >
 Cancel
 </button>
 </div>
 </form>
 </div>
 )}
 </div>
 </motion.div>
 </div>

 {/* Cancel Booking Modal */}
 {showCancelModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/90 ">
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="card max-w-md w-full p-8 relative"
 >
 <button
 onClick={() => setShowCancelModal(false)}
 className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors"
 >
 <FaTimes className="text-xl" />
 </button>

 <div className="text-center">
 <div className="text-6xl mb-4">⚠️</div>
 <h2 className="text-2xl font-bold text-white mb-2">Cancel Booking?</h2>
 <p className="text-gray-600 mb-6">
 Are you sure you want to cancel this booking? This action cannot be undone.
 </p>
 
 <div className="p-4 glass rounded-xl mb-6">
 <p className="text-sm text-gray-600">Service</p>
 <p className="text-white font-medium">{booking.service?.title}</p>
 <p className="text-sm text-gray-600 mt-2">Date & Time</p>
 <p className="text-white">
 {booking.dateTime ? new Date(booking.dateTime).toLocaleDateString() : 'N/A'} at{' '}
 {booking.dateTime ? new Date(booking.dateTime).toLocaleTimeString() : 'N/A'}
 </p>
 </div>

 <div className="flex gap-3">
 <button
 onClick={() => setShowCancelModal(false)}
 className="btn-secondary flex-1 py-3"
 >
 Keep Booking
 </button>
 <button
 onClick={handleCancelBooking}
 disabled={cancelling}
 className="btn-danger flex-1 py-3"
 >
 {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </div>
 )
}