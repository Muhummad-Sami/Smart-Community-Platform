'use client'

import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaTimesCircle, FaArrowLeft, FaCreditCard } from 'react-icons/fa'
import Link from 'next/link'

export default function PaymentCancelPage() {
 const searchParams = useSearchParams()
 const bookingId = searchParams.get('booking_id')

 return (
 <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#0f1629] to-[#0d1117]">
 <motion.div
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ type: 'spring', duration: 0.6 }}
 className="text-center max-w-md w-full"
 >
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
 className="w-28 h-28 rounded-full bg-red-500/20 border-4 border-red-400/50 flex items-center justify-center mx-auto mb-8"
 >
 <FaTimesCircle className="text-5xl text-red-400" />
 </motion.div>

 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
 <h1 className="text-4xl font-bold text-white mb-3">Payment Cancelled</h1>
 <p className="text-gray-600 text-lg mb-8">
 Your payment was cancelled. No charges were made to your account.
 </p>

 <div className="flex flex-col sm:flex-row gap-3 justify-center">
 {bookingId && (
 <Link href={`/payment/${bookingId}`} className="btn-primary flex items-center gap-2 justify-center">
 <FaCreditCard /> Try Again
 </Link>
 )}
 <Link href="/bookings" className="btn-secondary flex items-center gap-2 justify-center">
 <FaArrowLeft /> Back to Bookings
 </Link>
 </div>
 </motion.div>
 </motion.div>
 </div>
 )
}
