'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
 FaCalendarCheck, FaUser, FaClock, FaCheckCircle, 
 FaTimesCircle, FaHourglassHalf, FaArrowRight, FaEye, FaCreditCard
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { bookingService } from '@/services/api'

export default function BookingsPage() {
 const { user } = useAuth()
 const [bookings, setBookings] = useState<any[]>([])
 const [loading, setLoading] = useState(true)
 const [filter, setFilter] = useState('all')

 useEffect(() => {
 if (user) {
 fetchBookings()
 }
 }, [user])

 const fetchBookings = async () => {
 try {
 const response = await bookingService.getMyBookings()
 setBookings(response.data || [])
 } catch (error) {
 console.error('Error fetching bookings:', error)
 toast.error('Failed to load bookings')
 } finally {
 setLoading(false)
 }
 }

 const updateBookingStatus = async (bookingId: string, status: string) => {
 try {
 await bookingService.updateStatus(bookingId, status)
 toast.success(`Booking ${status.toLowerCase()} successfully!`)
 fetchBookings()
 } catch (error: any) {
 toast.error(error.response?.data?.error || `Failed to update status`)
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

 const getStatusIcon = (status: string) => {
 switch(status) {
 case 'PENDING': return <FaHourglassHalf className="text-yellow-500" />
 case 'ACCEPTED': return <FaCheckCircle className="text-green-500" />
 case 'REJECTED': return <FaTimesCircle className="text-red-500" />
 case 'COMPLETED': return <FaCheckCircle className="text-teal-500" />
 case 'CANCELLED': return <FaTimesCircle className="text-red-500" />
 default: return null
 }
 }

 const filteredBookings = filter === 'all' 
 ? bookings 
 : bookings.filter((b: any) => b.status === filter.toUpperCase())

 const stats = {
 total: bookings.length,
 pending: bookings.filter((b: any) => b.status === 'PENDING').length,
 accepted: bookings.filter((b: any) => b.status === 'ACCEPTED').length,
 completed: bookings.filter((b: any) => b.status === 'COMPLETED').length,
 }

  if (!user) {
  return (
  <div className="min-h-screen flex items-center justify-center px-4 bg-background">
  <div className="text-center">
  <h2 className="text-2xl font-bold text-primary-900 mb-4">Please Login</h2>
  <p className="text-primary-800 mb-6">You need to be logged in to view your bookings</p>
  <Link href="/login" className="btn-primary">Go to Login</Link>
  </div>
  </div>
  )
  }

  if (loading) {
  return (
  <div className="min-h-screen flex items-center justify-center bg-background">
  <div className="spinner"></div>
  </div>
  )
  }

  return (
  <div className="min-h-screen py-20 px-4 bg-background">
  <div className="container-custom max-w-6xl mx-auto">
  <motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  >
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
  <div>
  <h1 className="text-4xl font-bold text-primary-900">My Bookings</h1>
  <p className="text-primary-800 mt-2">Manage all your service bookings</p>
  </div>
  <Link href="/services" className="btn-primary inline-flex items-center gap-2">
  <FaCalendarCheck /> Book New Service
  </Link>
  </div>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
  <div className="card p-4 text-center">
  <div className="text-2xl font-bold text-primary-900">{stats.total}</div>
  <div className="text-sm text-primary-800">Total Bookings</div>
  </div>
  <div className="card p-4 text-center">
  <div className="text-2xl font-bold text-primary-700">{stats.pending}</div>
  <div className="text-sm text-primary-800">Pending</div>
  </div>
  <div className="card p-4 text-center">
  <div className="text-2xl font-bold text-primary-500">{stats.accepted}</div>
  <div className="text-sm text-primary-800">Accepted</div>
  </div>
  <div className="card p-4 text-center">
  <div className="text-2xl font-bold text-primary-900">{stats.completed}</div>
  <div className="text-sm text-primary-800">Completed</div>
  </div>
  </div>

  <div className="flex flex-wrap gap-2 mb-6">
  {[['all','All'],['pending','Pending'],['accepted','Accepted'],['completed','Completed']].map(([val,label]) => (
  <button key={val} onClick={() => setFilter(val)}
  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border ${
  filter === val ? 'bg-primary-500 border-primary-500 text-cream-100 shadow-md' : 'bg-surface border-border text-primary-900 hover:border-primary-500'
  }`}>{label}</button>
  ))}
  <button onClick={() => setFilter('cancelled')}
  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border ${
  filter === 'cancelled' ? 'bg-red-600 border-red-600 text-cream-100 shadow-md' : 'bg-surface border-border text-primary-900 hover:border-red-400'
  }`}>Cancelled</button>
  </div>

  {filteredBookings.length === 0 ? (
  <div className="card p-12 text-center">
  <div className="text-6xl mb-4">📋</div>
  <h3 className="text-xl font-semibold text-primary-900 mb-2">No bookings found</h3>
  <p className="text-primary-800 mb-6">You haven't made any bookings yet.</p>
  <Link href="/services" className="btn-primary inline-flex items-center gap-2">
  Browse Services <FaArrowRight />
  </Link>
  </div>
 ) : (
 <div className="space-y-4">
 {filteredBookings.map((booking: any) => (
  <motion.div
  key={booking.id}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="card p-6 hover:scale-[1.01] transition-all duration-300"
  >
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
  <div className="flex-1">
  <div className="flex items-center gap-3">
  <h3 className="text-lg font-semibold text-primary-900">
  {booking.service?.title || 'Service'}
  </h3>
  <span className={'badge ' + getStatusBadge(booking.status)}>
  {booking.status}
  </span>
  </div>
  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-primary-800">
  <span className="flex items-center gap-1">
  <FaUser className="text-primary-500" />
  {booking.provider?.fullName || 'Provider'}
  </span>
  <span className="flex items-center gap-1">
  <FaClock className="text-primary-500" />
  {new Date(booking.dateTime).toLocaleDateString()}
  </span>
  <span className="flex items-center gap-1">
  <FaClock className="text-primary-500" />
  {new Date(booking.dateTime).toLocaleTimeString()}
  </span>
  </div>
 {booking.notes && (
 <p className="text-gray-600 text-sm mt-2">{booking.notes}</p>
 )}
 </div>
  <div className="flex items-center gap-3">
  <span className="text-xl font-bold text-primary-900">
  ${booking.totalAmount}
  </span>
  </div>
              <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 flex-wrap md:flex-nowrap">
                <Link href={`/bookings/${booking.id}`} className="btn-secondary flex-1 md:flex-none justify-center items-center gap-2 flex">
                  <FaEye /> View Details
                </Link>
                {/* Client Pay Button */}
                {user?.id === booking.clientId && booking.status === 'ACCEPTED' && (
                  <Link 
                    href={`/payment/${booking.id}`} 
                    className="btn-primary flex-1 md:flex-none justify-center items-center gap-2 flex"
                  >
                    <FaCreditCard /> Pay Now
                  </Link>
                )}
                
                {/* Provider Actions */}
                {user?.id === booking.providerId && booking.status === 'PENDING' && (
                  <>
                    <button 
                      onClick={() => updateBookingStatus(booking.id, 'ACCEPTED')}
                      className="btn-primary flex-1 md:flex-none justify-center items-center gap-2 flex"
                    >
                      <FaCheckCircle /> Accept
                    </button>
                    <button 
                      onClick={() => updateBookingStatus(booking.id, 'REJECTED')}
                      className="btn-danger flex-1 md:flex-none justify-center items-center gap-2 flex"
                    >
                      <FaTimesCircle /> Reject
                    </button>
                  </>
                )}

                {user?.id === booking.providerId && booking.status === 'ACCEPTED' && (
                  <button 
                    onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                    className="btn-success flex-1 md:flex-none justify-center items-center gap-2 flex"
                  >
                    <FaCheckCircle /> Complete
                  </button>
                )}
              </div>
 </div>
 </motion.div>
 ))}
 </div>
 )}
 </motion.div>
 </div>
 </div>
 )
}