'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
 FaArrowLeft, FaCalendarCheck, FaUser, FaClock, 
 FaSearch, FaEye, FaTimes, FaCheck, FaEnvelope,
 FaPhone, FaExclamationTriangle
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import api from '@/services/api/api'
import { AdminRoute } from '@/components/shared/AdminRoute'

export default function AdminBookingsPage() {
 const { user } = useAuth()
 const [bookings, setBookings] = useState<any[]>([])
 const [loading, setLoading] = useState(true)
 const [searchTerm, setSearchTerm] = useState('')
 const [filterStatus, setFilterStatus] = useState<string>('all')
 const [selectedBooking, setSelectedBooking] = useState<any>(null)
 const [showModal, setShowModal] = useState(false)

 useEffect(() => {
 if (user && user.role === 'ADMIN') {
 fetchBookings()
 }
 }, [user])

 const fetchBookings = async () => {
 try {
 const response = await api.get('/admin/bookings')
 setBookings(response.data.data)
 } catch (error) {
 console.error('Error fetching bookings:', error)
 toast.error('Failed to load bookings')
 } finally {
 setLoading(false)
 }
 }

 const cancelBooking = async (bookingId: string) => {
 if (!confirm('Are you sure you want to cancel this booking?')) return
 try {
 await api.put(`/bookings/${bookingId}/cancel`)
 toast.success('Booking cancelled successfully')
 fetchBookings()
 } catch (error) {
 console.error('Error cancelling booking:', error)
 toast.error('Failed to cancel booking')
 }
 }

 const completeBooking = async (bookingId: string) => {
 if (!confirm('Are you sure you want to mark this booking as completed?')) return
 try {
 await api.put(`/bookings/${bookingId}/status`, { status: 'COMPLETED' })
 toast.success('Booking marked as completed')
 fetchBookings()
 } catch (error) {
 console.error('Error completing booking:', error)
 toast.error('Failed to complete booking')
 }
 }

 const viewBookingDetails = (booking: any) => {
 setSelectedBooking(booking)
 setShowModal(true)
 }

 const getFilteredBookings = () => {
 let filtered = bookings

 if (filterStatus !== 'all') {
 filtered = filtered.filter(b => b.status === filterStatus.toUpperCase())
 }

 if (searchTerm) {
 filtered = filtered.filter(b =>
 b.service?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
 b.client?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
 b.provider?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
 b.id?.toLowerCase().includes(searchTerm.toLowerCase())
 )
 }

 return filtered
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

 const filteredBookings = getFilteredBookings()

 // Stats
 const totalBookings = bookings.length
 const pendingBookings = bookings.filter(b => b.status === 'PENDING').length
 const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length
 const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length

 return (
 <AdminRoute>
 <div className="min-h-screen py-24 px-4 bg-gradient-to-b from-[#0f1629] to-[#0d1117]">
 <div className="container-custom max-w-7xl mx-auto">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
 <div>
 <Link href="/admin/dashboard" className="text-gray-600 hover:text-white transition-colors inline-flex items-center gap-2 mb-4 text-sm font-medium">
 <FaArrowLeft /> Back to Dashboard
 </Link>
 <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
 <FaCalendarCheck className="text-[#14B8A6]" /> Booking Management
 </h1>
 <p className="text-gray-600">View and manage all bookings on the platform</p>
 </div>
 
 <div className="flex flex-wrap gap-4">
 <div className="card px-5 py-3 flex items-center gap-3">
 <div>
 <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wider text-right">Total</p>
 <p className="text-xl font-bold text-white text-right">{totalBookings}</p>
 </div>
 </div>
 <div className="card px-5 py-3 flex items-center gap-3">
 <div>
 <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wider text-right">Pending</p>
 <p className="text-xl font-bold text-amber-400 text-right">{pendingBookings}</p>
 </div>
 </div>
 <div className="card px-5 py-3 flex items-center gap-3 hidden sm:flex">
 <div>
 <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wider text-right">Completed</p>
 <p className="text-xl font-bold text-emerald-400 text-right">{completedBookings}</p>
 </div>
 </div>
 </div>
 </div>

 <div className="card p-0 overflow-hidden flex flex-col">
 {/* Toolbar */}
 <div className="p-5 border-b border-gray-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div className="relative w-full md:max-w-md">
 <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4b5e7a]" />
 <input
 type="text"
 placeholder="Search by service, client, provider..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="input-field pl-11 py-2.5 bg-white border-transparent focus:border-[#14B8A6] focus:bg-gray-100 w-full text-sm"
 />
 </div>
 <div className="flex-shrink-0">
 <select
 value={filterStatus}
 onChange={(e) => setFilterStatus(e.target.value)}
 className="input-field py-2.5 bg-white border-transparent focus:border-[#14B8A6] focus:bg-gray-100 text-sm text-white appearance-none pr-10"
 >
 <option value="all" className="bg-primary-900 text-white">All Status</option>
 <option value="pending" className="bg-primary-900 text-white">Pending</option>
 <option value="accepted" className="bg-primary-900 text-white">Accepted</option>
 <option value="completed" className="bg-primary-900 text-white">Completed</option>
 <option value="cancelled" className="bg-primary-900 text-white">Cancelled</option>
 <option value="rejected" className="bg-primary-900 text-white">Rejected</option>
 </select>
 </div>
 </div>

 {/* Table */}
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-white border-b border-gray-200">
 <th className="py-4 px-6 text-[11px] font-bold text-gray-600 uppercase tracking-wider">Service</th>
 <th className="py-4 px-6 text-[11px] font-bold text-gray-600 uppercase tracking-wider">Client</th>
 <th className="py-4 px-6 text-[11px] font-bold text-gray-600 uppercase tracking-wider">Provider</th>
 <th className="py-4 px-6 text-[11px] font-bold text-gray-600 uppercase tracking-wider">Date</th>
 <th className="py-4 px-6 text-[11px] font-bold text-gray-600 uppercase tracking-wider">Amount</th>
 <th className="py-4 px-6 text-[11px] font-bold text-gray-600 uppercase tracking-wider">Status</th>
 <th className="py-4 px-6 text-[11px] font-bold text-gray-600 uppercase tracking-wider text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/5">
 {filteredBookings.length === 0 ? (
 <tr>
 <td colSpan={7} className="text-center py-12">
 <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4">
 <FaCalendarCheck className="text-2xl text-[#4b5e7a]" />
 </div>
 <h3 className="text-white font-semibold mb-1">No Bookings Found</h3>
 <p className="text-gray-600 text-sm">Adjust your search or filters to find what you're looking for.</p>
 </td>
 </tr>
 ) : (
 filteredBookings.map((booking) => (
 <motion.tr
 key={booking.id}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="hover:bg-white transition-colors group"
 >
 <td className="py-4 px-6">
 <p className="text-sm font-semibold text-white">{booking.service?.title || 'N/A'}</p>
 </td>
 <td className="py-4 px-6">
 <p className="text-xs text-gray-600">{booking.client?.fullName || 'N/A'}</p>
 </td>
 <td className="py-4 px-6">
 <p className="text-xs text-gray-600">{booking.provider?.fullName || 'N/A'}</p>
 </td>
 <td className="py-4 px-6">
 <p className="text-xs text-gray-600">
 {booking.dateTime ? new Date(booking.dateTime).toLocaleDateString() : 'N/A'}
 </p>
 </td>
 <td className="py-4 px-6">
 <span className="text-sm font-medium text-[#4ade80]">${booking.totalAmount || 0}</span>
 </td>
 <td className="py-4 px-6">
 <span className={`badge text-[10px] ${getStatusBadge(booking.status)}`}>
 {booking.status}
 </span>
 </td>
 <td className="py-4 px-6 text-right">
 <div className="flex items-center justify-end gap-2">
 <button
 onClick={() => viewBookingDetails(booking)}
 className="w-8 h-8 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-white transition-colors"
 title="View Details"
 >
 <FaEye />
 </button>
 
 {booking.status === 'PENDING' && (
 <>
 <button
 onClick={() => completeBooking(booking.id)}
 className="w-8 h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 flex items-center justify-center transition-colors"
 title="Mark as Completed"
 >
 <FaCheck />
 </button>
 <button
 onClick={() => cancelBooking(booking.id)}
 className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors"
 title="Cancel Booking"
 >
 <FaTimes />
 </button>
 </>
 )}
 
 {booking.status === 'ACCEPTED' && (
 <button
 onClick={() => completeBooking(booking.id)}
 className="w-8 h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 flex items-center justify-center transition-colors"
 title="Mark as Completed"
 >
 <FaCheck />
 </button>
 )}
 </div>
 </td>
 </motion.tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Booking Details Modal */}
 {showModal && selectedBooking && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900 ">
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 className="card max-w-2xl w-full p-0 relative max-h-[90vh] overflow-y-auto"
 >
 <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-primary-900 z-10">
 <h2 className="text-xl font-bold text-white flex items-center gap-2">
 <FaCalendarCheck className="text-[#14B8A6]" /> Booking Details
 </h2>
 <button
 onClick={() => setShowModal(false)}
 className="w-8 h-8 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-white transition-colors"
 >
 <FaTimes />
 </button>
 </div>

 <div className="p-6 space-y-6">
 {/* Status & Amount Hero */}
 <div className="flex flex-col sm:flex-row gap-4">
 <div className="flex-1 bg-gradient-to-br from-[#14B8A6]/10 to-[#0D9488]/10 border border-[#14B8A6]/20 rounded-2xl p-5 flex items-center justify-between">
 <div>
 <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Total Amount</p>
 <p className="text-3xl font-bold text-white">${selectedBooking.totalAmount || 0}</p>
 </div>
 <div className="w-12 h-12 rounded-xl bg-[#14B8A6]/20 flex items-center justify-center text-[#14B8A6] text-xl">
 <FaClock />
 </div>
 </div>
 <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between">
 <div>
 <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Status</p>
 <span className={`badge ${getStatusBadge(selectedBooking.status)}`}>
 {selectedBooking.status}
 </span>
 </div>
 <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 text-xl">
 <FaCheck />
 </div>
 </div>
 </div>

 {/* Service Info */}
 <div>
 <h3 className="text-sm font-semibold text-white mb-3">Service Information</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div className="bg-white rounded-xl p-4">
 <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Title</p>
 <p className="text-sm text-white font-medium">{selectedBooking.service?.title || 'N/A'}</p>
 </div>
 <div className="bg-white rounded-xl p-4">
 <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Category</p>
 <p className="text-sm text-white font-medium">{selectedBooking.service?.category || 'N/A'}</p>
 </div>
 <div className="bg-white rounded-xl p-4">
 <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Date</p>
 <p className="text-sm text-white font-medium">
 {selectedBooking.dateTime ? new Date(selectedBooking.dateTime).toLocaleDateString() : 'N/A'}
 </p>
 </div>
 <div className="bg-white rounded-xl p-4">
 <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Time</p>
 <p className="text-sm text-white font-medium">
 {selectedBooking.dateTime ? new Date(selectedBooking.dateTime).toLocaleTimeString() : 'N/A'}
 </p>
 </div>
 </div>
 </div>

 {/* Users Info */}
 <div>
 <h3 className="text-sm font-semibold text-white mb-3">Participants</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="bg-white rounded-xl p-4 border border-gray-200">
 <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-3">Client</p>
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
 {selectedBooking.client?.fullName?.charAt(0) || 'C'}
 </div>
 <div className="min-w-0">
 <p className="text-sm font-semibold text-white truncate">{selectedBooking.client?.fullName || 'Unknown'}</p>
 <p className="text-[11px] text-gray-600 truncate">{selectedBooking.client?.email}</p>
 </div>
 </div>
 </div>
 <div className="bg-white rounded-xl p-4 border border-gray-200">
 <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-3">Provider</p>
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#34d399] flex items-center justify-center text-white font-bold text-sm shadow-md">
 {selectedBooking.provider?.fullName?.charAt(0) || 'P'}
 </div>
 <div className="min-w-0">
 <p className="text-sm font-semibold text-white truncate">{selectedBooking.provider?.fullName || 'Unknown'}</p>
 <p className="text-[11px] text-gray-600 truncate">{selectedBooking.provider?.email}</p>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Notes */}
 {selectedBooking.notes && (
 <div>
 <h3 className="text-sm font-semibold text-white mb-3">Additional Notes</h3>
 <div className="bg-white rounded-xl p-4 border border-gray-200 text-sm text-[#cbd5e1] leading-relaxed">
 {selectedBooking.notes}
 </div>
 </div>
 )}
 </div>

 {/* Actions Footer */}
 <div className="p-6 border-t border-gray-200 bg-white flex gap-3 rounded-b-2xl">
 <button
 onClick={() => setShowModal(false)}
 className="btn-secondary flex-1 py-2.5"
 >
 Close
 </button>
 {selectedBooking.status === 'PENDING' && (
 <>
 <button
 onClick={() => {
 completeBooking(selectedBooking.id)
 setShowModal(false)
 }}
 className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors py-2.5"
 >
 <FaCheck /> Complete
 </button>
 <button
 onClick={() => {
 cancelBooking(selectedBooking.id)
 setShowModal(false)
 }}
 className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors py-2.5"
 >
 <FaTimes /> Cancel
 </button>
 </>
 )}
 </div>
 </motion.div>
 </div>
 )}
 </div>
 </div>
 </AdminRoute>
 )
}