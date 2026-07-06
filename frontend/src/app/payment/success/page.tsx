'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaCheckCircle, FaFileInvoice, FaArrowRight, FaHome } from 'react-icons/fa'
import Link from 'next/link'
import api from '@/services/api/api'

export default function PaymentSuccessPage() {
 const searchParams = useSearchParams()
 const router = useRouter()
 const sessionId = searchParams.get('session_id')
 const bookingId = searchParams.get('booking_id')
 const isMock = searchParams.get('mock') === 'true'
 const [completed, setCompleted] = useState(false)

 useEffect(() => {
 if (bookingId && sessionId) {
 // Confirm payment on backend (important for mock mode)
 api.post('/payments/complete', { bookingId, sessionId })
 .finally(() => setCompleted(true))
 } else {
 setCompleted(true)
 }
 }, [bookingId, sessionId])

 return (
 <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#0f1629] to-[#0d1117]">
 <motion.div
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ type: 'spring', duration: 0.6 }}
 className="text-center max-w-md w-full"
 >
 {/* Success Animation */}
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
 className="w-28 h-28 rounded-full bg-emerald-500/20 border-4 border-emerald-400/50 flex items-center justify-center mx-auto mb-8"
 >
 <FaCheckCircle className="text-5xl text-emerald-400" />
 </motion.div>

 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
 <h1 className="text-4xl font-bold text-white mb-3">Payment Successful!</h1>
 <p className="text-gray-600 text-lg mb-2">Your booking has been confirmed and payment processed.</p>
 {isMock && (
 <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2 mb-4 text-amber-400 text-sm inline-block">
 Demo Mode — Configure Stripe keys for real payments
 </div>
 )}
 <p className="text-[#4b5e7a] text-sm mb-8">
 A confirmation email has been sent to your registered email address.
 </p>

 <div className="flex flex-col sm:flex-row gap-3 justify-center">
 {bookingId && (
 <a
 href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/invoices/${bookingId}`}
 target="_blank"
 className="btn-secondary flex items-center gap-2 justify-center"
 >
 <FaFileInvoice className="text-[#60a5fa]" /> Download Invoice
 </a>
 )}
 <Link href="/bookings" className="btn-primary flex items-center gap-2 justify-center">
 View Bookings <FaArrowRight className="text-xs" />
 </Link>
 <Link href="/" className="btn-secondary flex items-center gap-2 justify-center">
 <FaHome /> Home
 </Link>
 </div>
 </motion.div>
 </motion.div>
 </div>
 )
}
