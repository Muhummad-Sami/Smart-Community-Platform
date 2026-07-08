'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
 FaUser, FaClock, FaTag, FaArrowLeft, FaStar, 
 FaCalendarCheck, FaEnvelope, FaPhone, FaMapMarker,
 FaShare, FaHeart, FaRegHeart, FaCheckCircle,
 FaTimes, FaQrcode
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { serviceService } from '@/services/api'
import { bookingService } from '@/services/api'
import api from '@/services/api/api'
import { useAuth } from '@/context/AuthContext'

export default function ServiceDetailsPage() {
 const params = useParams()
 const router = useRouter()
 const { user } = useAuth()
 const [service, setService] = useState<any>(null)
 const [loading, setLoading] = useState(true)
 const [isFavorite, setIsFavorite] = useState(false)
 const [showBookingModal, setShowBookingModal] = useState(false)
 const [showQrModal, setShowQrModal] = useState(false)
 const [qrCodeData, setQrCodeData] = useState('')
 const [bookingDate, setBookingDate] = useState('')
 const [bookingTime, setBookingTime] = useState('')
 const [availableTimes, setAvailableTimes] = useState<string[]>([])
 const [fetchingTimes, setFetchingTimes] = useState(false)
 const [bookingNotes, setBookingNotes] = useState('')
 const [submitting, setSubmitting] = useState(false)

 const serviceId = params?.id as string

 useEffect(() => {
 if (serviceId) {
 fetchService()
 }
 }, [serviceId])

 const fetchService = async () => {
 try {
 const response = await serviceService.getById(serviceId)
 setService(response.data)
 } catch (error) {
 console.error('Error fetching service:', error)
 toast.error('Service not found')
 router.push('/services')
 } finally {
 setLoading(false)
 }
 }

 const fetchAvailability = async (date: string) => {
 setBookingDate(date)
 setBookingTime('')
 setFetchingTimes(true)
 try {
 const res = await api.get(`/calendar/${serviceId}/availability?date=${date}`)
 setAvailableTimes(res.data.data.availableTimes || [])
 } catch (err) {
 toast.error('Failed to fetch availability')
 setAvailableTimes([])
 } finally {
 setFetchingTimes(false)
 }
 }

 const handleBookNow = async (e: React.FormEvent) => {
 e.preventDefault()
 if (!bookingDate || !bookingTime) {
 toast.error('Please select date and time')
 return
 }

 setSubmitting(true)
 try {
 const dateTime = new Date(`${bookingDate}T${bookingTime}`)
 const response = await bookingService.create({
 serviceId: service.id,
 dateTime: dateTime.toISOString(),
 notes: bookingNotes,
 })
 
 toast.success('Booking confirmed successfully!')
 setShowBookingModal(false)
 router.push('/bookings')
 } catch (error: any) {
 toast.error(error.response?.data?.error || 'Failed to create booking')
 } finally {
 setSubmitting(false)
 }
 }

 const handleBook = () => {
 if (!user) {
 toast.error('Please login to book this service')
 router.push('/login')
 return
 }
 if (user.id === service?.userId) {
 toast.error('You cannot book your own service')
 return
 }
 setShowBookingModal(true)
 }

 const handleDelete = async () => {
 if (!confirm('Are you sure you want to delete this service?')) return
 try {
 await serviceService.delete(service.id)
 toast.success('Service deleted')
 router.push('/services')
 } catch (error) {
 toast.error('Failed to delete service')
 }
 }

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="spinner"></div>
 </div>
 )
 }

 if (!service) {
 return (
 <div className="min-h-screen flex items-center justify-center px-4">
 <div className="text-center">
 <div className="text-6xl mb-4">🔍</div>
 <h2 className="text-2xl font-bold text-white mb-4">Service Not Found</h2>
 <Link href="/services" className="btn-primary">Back to Services</Link>
 </div>
 </div>
 )
 }

 const portfolioImages = service.portfolioImages && typeof service.portfolioImages === 'string' 
 ? JSON.parse(service.portfolioImages) 
 : []

 return (
 <div className="min-h-screen py-20 px-4">
 <div className="container-custom max-w-6xl mx-auto">
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 >
 <Link href="/services" className="inline-flex items-center gap-2 text-primary-800 hover:text-primary-900 font-medium transition-colors mb-6">
 <FaArrowLeft /> Back to Services
 </Link>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Main Content */}
 <div className="lg:col-span-2 space-y-6">
 <div className="card p-8">
 <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
 <div className="flex-1">
 <h1 className="text-3xl md:text-4xl font-bold gradient-text">
 {service.title}
 </h1>
 <div className="flex flex-wrap items-center gap-3 mt-3">
 <span className="badge-primary">{service.category}</span>
 {service.availability ? (
 <span className="badge-success inline-flex items-center gap-1">
 <FaCheckCircle className="text-xs" /> Available
 </span>
 ) : (
 <span className="badge-danger">Unavailable</span>
 )}
 </div>
 </div>
 <div className="flex items-center gap-3">
 <button
 onClick={() => setIsFavorite(!isFavorite)}
 className="p-3 glass rounded-full hover:scale-110 transition-all duration-300"
 >
 {isFavorite ? <FaHeart className="text-red-500 text-xl" /> : <FaRegHeart className="text-gray-600 text-xl" />}
 </button>
 <button
 onClick={() => {
 navigator.clipboard?.writeText(window.location.href)
 toast.success('Link copied!')
 }}
 className="p-3 glass rounded-full hover:scale-110 transition-all duration-300"
 >
 <FaShare className="text-gray-600 text-xl" />
 </button>
 <button
 onClick={async () => {
 try {
 const res = await api.get(`/qr/generate?url=${encodeURIComponent(window.location.href)}`)
 setQrCodeData(res.data.data.qrCode)
 setShowQrModal(true)
 } catch (err) {
 toast.error('Failed to generate QR code')
 }
 }}
 className="p-3 glass rounded-full hover:scale-110 transition-all duration-300"
 >
 <FaQrcode className="text-gray-600 text-xl" />
 </button>
 </div>
 </div>

 <div className="mt-6 p-4 glass rounded-xl">
 <span className="text-4xl font-bold gradient-text">${service.price}</span>
 <span className="text-gray-600 ml-2">/ {service.deliveryTime || 'project'}</span>
 </div>

 <div className="mt-6">
 <h3 className="text-lg font-semibold text-white mb-3">About This Service</h3>
 <p className="text-gray-800 leading-relaxed">{service.description}</p>
 </div>
 </div>

 {portfolioImages.length > 0 && (
 <div className="card p-8">
 <h3 className="text-lg font-semibold text-white mb-4">Portfolio</h3>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
 {portfolioImages.map((img: string, index: number) => (
 <div key={index} className="aspect-square rounded-xl overflow-hidden">
 <img src={img} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover" />
 </div>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* Sidebar */}
 <div className="space-y-6">
 <div className="card p-6 text-center">
 <div className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center text-3xl font-bold text-white mx-auto">
 {service.user?.fullName?.charAt(0) || 'U'}
 </div>
 <h4 className="text-lg font-semibold text-white mt-4">
 {service.user?.fullName || 'Unknown Provider'}
 </h4>
 <p className="text-gray-600 text-sm">@{service.user?.username || 'provider'}</p>

 <div className="mt-4 space-y-3">
 {user?.id !== service.userId && (
 <Link 
 href={`/messages?userId=${service.user.id}`}
 className="btn-secondary w-full py-2 text-sm inline-flex items-center justify-center gap-2"
 >
 <FaEnvelope /> Message
 </Link>
 )}
 {user?.id !== service.userId ? (
 <button onClick={handleBook} className="btn-primary w-full py-3 text-lg">
 <FaCalendarCheck className="inline mr-2" /> Book Now
 </button>
 ) : (
 <div className="space-y-2">
 <div className="text-xs text-center text-primary-800 font-medium py-1">This is your service</div>
 <div className="flex gap-2">
 <Link href={`/services/${service.id}/edit`} className="btn-secondary flex-1 py-2 text-sm inline-flex items-center justify-center gap-2">
 ✏️ Edit
 </Link>
 <button onClick={handleDelete} className="btn-danger flex-1 py-2 text-sm inline-flex items-center justify-center gap-2">
 🗑️ Delete
 </button>
 </div>
 </div>
 )}
 </div>
 </div>

 <div className="card p-6">
 <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Quick Info</h4>
 <div className="space-y-3">
 <div className="flex items-center gap-3 text-gray-800">
 <FaUser className="text-[#14B8A6]" />
 <span className="text-sm">{service.user?.fullName || 'Unknown'}</span>
 </div>
 <div className="flex items-center gap-3 text-gray-800">
 <FaTag className="text-[#14B8A6]" />
 <span className="text-sm">{service.category}</span>
 </div>
 <div className="flex items-center gap-3 text-gray-800">
 <FaClock className="text-[#14B8A6]" />
 <span className="text-sm">{service.deliveryTime || '2-3 days'}</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </motion.div>
 </div>

 {/* Booking Modal */}
 {showBookingModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/90 ">
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="card max-w-md w-full p-8 relative"
 >
 <button
 onClick={() => setShowBookingModal(false)}
 className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors"
 >
 <FaTimes className="text-xl" />
 </button>

 <h2 className="text-2xl font-bold gradient-text mb-2">Book This Service</h2>
 <p className="text-gray-600 mb-4">{service.title}</p>

 <div className="mb-4 p-3 glass rounded-xl">
 <span className="text-2xl font-bold gradient-text">${service.price}</span>
 <span className="text-gray-600 ml-2">/ {service.deliveryTime || 'project'}</span>
 </div>

 <form onSubmit={handleBookNow} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-800 mb-2">Select Date</label>
 <input
 type="date"
 required
 min={new Date().toISOString().split('T')[0]}
 value={bookingDate}
 onChange={(e) => fetchAvailability(e.target.value)}
 className="input-field"
 />
 </div>

 {bookingDate && (
 <div>
 <label className="block text-sm font-medium text-gray-800 mb-2">
 Select Time {fetchingTimes && <span className="text-blue-400 text-xs ml-2 animate-pulse">Loading...</span>}
 </label>
 {!fetchingTimes && availableTimes.length === 0 ? (
 <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
 No times available on this date.
 </p>
 ) : (
 <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
 {availableTimes.map((time) => (
 <button
 key={time}
 type="button"
 onClick={() => setBookingTime(time)}
 className={`py-2 rounded-lg text-sm transition-all duration-200 border ${
 bookingTime === time
 ? 'bg-teal-500 text-white border-transparent shadow-lg'
 : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
 }`}
 >
 {time}
 </button>
 ))}
 </div>
 )}
 </div>
 )}

 <div>
 <label className="block text-sm font-medium text-gray-800 mb-2">Additional Notes</label>
 <textarea
 rows={3}
 value={bookingNotes}
 onChange={(e) => setBookingNotes(e.target.value)}
 className="input-field"
 placeholder="Any special requests..."
 />
 </div>

 <button
 type="submit"
 disabled={submitting}
 className="btn-primary w-full py-3 text-lg"
 >
 {submitting ? 'Booking...' : 'Confirm Booking'}
 </button>
 </form>
 </motion.div>
 </div>
 )}

 {/* QR Modal */}
 {showQrModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/90 ">
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="card max-w-sm w-full p-8 relative text-center"
 >
 <button
 onClick={() => setShowQrModal(false)}
 className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors"
 >
 <FaTimes className="text-xl" />
 </button>

 <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
 <FaQrcode className="text-[#14B8A6]" /> Share Service
 </h2>
 <p className="text-gray-600 mb-6">Scan this QR code to view the service on your mobile device.</p>

 {qrCodeData ? (
 <div className="bg-white p-4 rounded-xl inline-block mb-6">
 <img src={qrCodeData} alt="QR Code" className="w-48 h-48" />
 </div>
 ) : (
 <div className="w-48 h-48 mx-auto bg-gray-800 rounded-xl animate-pulse mb-6" />
 )}

 <button
 onClick={() => {
 navigator.clipboard?.writeText(window.location.href)
 toast.success('Link copied!')
 setShowQrModal(false)
 }}
 className="btn-secondary w-full py-2 text-sm"
 >
 Copy Link Instead
 </button>
 </motion.div>
 </div>
 )}
 </div>
 )
}