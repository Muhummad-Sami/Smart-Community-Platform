'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaLock, FaCreditCard, FaShieldAlt, FaSpinner, FaCheckCircle } from 'react-icons/fa'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api/api'
import Link from 'next/link'

export default function PaymentPage() {
 const params = useParams()
 const router = useRouter()
 const { user } = useAuth()
 const bookingId = params.bookingId as string

 const [booking, setBooking] = useState<any>(null)
 const [loading, setLoading] = useState(true)
 const [processing, setProcessing] = useState(false)
 const [error, setError] = useState('')

 useEffect(() => {
 if (bookingId) fetchBooking()
 }, [bookingId])

 const fetchBooking = async () => {
 try {
 const res = await api.get(`/bookings/${bookingId}`)
 setBooking(res.data.data)
 } catch {
 setError('Booking not found')
 } finally {
 setLoading(false)
 }
 }

 const handlePayment = async () => {
 setProcessing(true)
 setError('')
 try {
 const res = await api.post('/payments/create-checkout-session', { bookingId })
 const { url, isMock } = res.data.data

 if (isMock) {
 // Mock mode: redirect directly to success
 router.push(url)
 } else {
 // Real Stripe: redirect to Stripe hosted checkout
 window.location.href = url
 }
 } catch (err: any) {
 setError(err.response?.data?.error || 'Payment failed. Please try again.')
 setProcessing(false)
 }
 }

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <FaSpinner className="text-4xl text-[#14B8A6] animate-spin" />
 </div>
 )
 }

 if (error && !booking) {
 return (
 <div className="min-h-screen flex items-center justify-center px-4">
 <div className="text-center">
 <p className="text-red-400 mb-4">{error}</p>
 <Link href="/bookings" className="btn-primary">Back to Bookings</Link>
 </div>
 </div>
 )
 }

 if (booking?.paymentStatus === 'PAID') {
 return (
 <div className="min-h-screen flex items-center justify-center px-4">
 <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center card max-w-md w-full">
 <FaCheckCircle className="text-6xl text-emerald-400 mx-auto mb-4" />
 <h2 className="text-2xl font-bold text-white mb-2">Already Paid</h2>
 <p className="text-gray-600 mb-6">This booking has already been paid.</p>
 <Link href="/bookings" className="btn-primary">View Bookings</Link>
 </motion.div>
 </div>
 )
 }

 return (
 <div className="min-h-screen py-24 px-4 bg-gradient-to-b from-[#0f1629] to-[#0d1117]">
 <div className="max-w-lg mx-auto">
 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
 {/* Header */}
 <div className="text-center mb-8">
 <div className="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-lg/30">
 <FaCreditCard className="text-2xl text-white" />
 </div>
 <h1 className="text-3xl font-bold text-white mb-2">Complete Payment</h1>
 <p className="text-gray-600">Secure checkout powered by Stripe</p>
 </div>

 {/* Order Summary */}
 <div className="card mb-6">
 <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
 <FaShieldAlt className="text-[#14B8A6]" /> Order Summary
 </h3>
 <div className="space-y-3">
 <div className="flex justify-between">
 <span className="text-gray-600">Service</span>
 <span className="text-white font-medium">{booking?.service?.title}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-gray-600">Provider</span>
 <span className="text-white">{booking?.provider?.fullName}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-gray-600">Date</span>
 <span className="text-white">{booking?.dateTime ? new Date(booking.dateTime).toLocaleDateString() : 'TBD'}</span>
 </div>
 {booking?.notes && (
 <div className="flex justify-between">
 <span className="text-gray-600">Notes</span>
 <span className="text-white text-sm max-w-[60%] text-right">{booking.notes}</span>
 </div>
 )}
 <div className="border-t border-gray-200 pt-3 flex justify-between">
 <span className="text-white font-semibold text-lg">Total</span>
 <span className="text-2xl font-bold gradient-text">${booking?.totalAmount?.toFixed(2)}</span>
 </div>
 </div>
 </div>

 {/* Security Badges */}
 <div className="flex items-center justify-center gap-6 mb-6 text-xs text-[#64748b]">
 <span className="flex items-center gap-1"><FaLock className="text-emerald-400" /> 256-bit SSL</span>
 <span className="flex items-center gap-1"><FaShieldAlt className="text-[#14B8A6]" /> Stripe Secure</span>
 <span className="flex items-center gap-1"><FaCheckCircle className="text-[#a78bfa]" /> Buyer Protected</span>
 </div>

 {error && (
 <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 text-red-400 text-sm">
 {error}
 </div>
 )}

 {/* Pay Button */}
 <motion.button
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 onClick={handlePayment}
 disabled={processing}
 className="w-full py-4 rounded-xl bg-teal-500 text-white font-bold text-lg
 shadow-lg shadow-lg/30 hover:shadow-lg/50 transition-all duration-300
 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
 >
 {processing ? (
 <><FaSpinner className="animate-spin" /> Processing...</>
 ) : (
 <><FaLock /> Pay ${booking?.totalAmount?.toFixed(2)} Securely</>
 )}
 </motion.button>

 <p className="text-center text-xs text-[#4b5e7a] mt-4">
 By completing this payment, you agree to our{' '}
 <Link href="/about" className="text-[#60a5fa] hover:underline">Terms of Service</Link>
 </p>
 </motion.div>
 </div>
 </div>
 )
}
