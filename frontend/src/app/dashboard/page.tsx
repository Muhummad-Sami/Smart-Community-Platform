'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FaUser, FaCalendarCheck, FaSignOutAlt, FaShoppingBag, 
  FaSearch, FaArrowRight, FaBoxOpen
} from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import api from '@/services/api/api'
import { toast } from 'react-hot-toast'

export default function ClientDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [stats, setStats] = useState({ bookings: 0, favorites: 0 })
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchStats()
      fetchBookings()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const response = await api.get('/users/profile/stats')
      setStats(response.data.data)
    } catch (error) {}
  }

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my')
      setBookings(response.data.data)
    } catch (error) {} finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Please Login</h2>
          <Link href="/login" className="btn-primary">Go to Login</Link>
        </div>
      </div>
    )
  }

  if (user.role === 'PROVIDER') {
    router.push('/provider/dashboard')
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="spinner"></div>
      </div>
    )
  }

  const statItems = [
    { icon: <FaCalendarCheck />, label: 'My Bookings', value: stats.bookings, color: 'from-primary-500 to-primary-700' },
    { icon: <FaShoppingBag />, label: 'Favorites', value: stats.favorites, color: 'from-primary-400 to-primary-600' },
  ]

  const recentBookings = bookings.slice(0, 4)

  return (
    <div className="min-h-screen py-24 px-4 bg-background">
      <div className="container-custom max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-900 mb-1">
              Welcome, <span className="text-primary-500">{user.fullName}</span>
            </h1>
            <p className="text-primary-800">Client Dashboard — manage your bookings and favorites</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
            <Link href="/profile" className="btn-secondary">
              <FaUser /> Profile
            </Link>
            <button onClick={handleLogout} className="btn-danger">
              <FaSignOutAlt /> Logout
            </button>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8"
        >
          {statItems.map((stat, i) => (
            <div key={i} className="stat-card flex items-center gap-6 p-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-cream-100 text-2xl shadow-lg`}>
                {stat.icon}
              </div>
              <div className="text-left">
                <div className="text-4xl font-bold text-primary-900 mb-1">{stat.value}</div>
                <div className="text-primary-800 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Actions & Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/services" className="btn-primary w-full justify-between px-5">
                  <span className="flex items-center gap-2"><FaSearch /> Find a Service</span>
                  <FaArrowRight className="text-xs opacity-70" />
                </Link>
                <Link href="/products" className="btn-secondary w-full justify-between px-5">
                  <span className="flex items-center gap-2"><FaShoppingBag /> Browse Products</span>
                  <FaArrowRight className="text-xs opacity-70" />
                </Link>
                <Link href="/bookings" className="btn-secondary w-full justify-between px-5">
                  <span className="flex items-center gap-2"><FaCalendarCheck /> All Bookings</span>
                  <FaArrowRight className="text-xs opacity-70" />
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="lg:col-span-2 card p-0 overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-border flex items-center justify-between bg-surface">
              <h3 className="text-lg font-semibold text-primary-900">Recent Bookings</h3>
              <Link href="/bookings" className="text-sm text-primary-500 hover:text-primary-900 font-semibold transition-colors">View all</Link>
            </div>
            <div className="flex-1 p-6 bg-background">
              {recentBookings.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
                    <FaBoxOpen className="text-2xl text-primary-500" />
                  </div>
                  <p className="text-primary-800 mb-4">You have no recent bookings.</p>
                  <Link href="/services" className="btn-primary text-sm px-6">Book a Service</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking: any) => (
                    <div key={booking.id} className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border hover:border-primary-400 transition-colors">
                      <div>
                        <div className="font-semibold text-primary-900 mb-1">{booking.service?.title || 'Service'}</div>
                        <div className="text-xs text-primary-800">{new Date(booking.dateTime).toLocaleDateString()} at {booking.timeSlot}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`badge ${
                          booking.status === 'PENDING' ? 'badge-warning' :
                          booking.status === 'COMPLETED' ? 'badge-success' :
                          booking.status === 'ACCEPTED' ? 'badge-primary' :
                          'badge-danger'
                        }`}>
                          {booking.status}
                        </span>
                        {booking.status === 'ACCEPTED' ? (
                          <Link href={`/payment/${booking.id}`} className="btn-primary px-3 py-1.5 text-xs">
                            Pay Now
                          </Link>
                        ) : (
                          <Link href="/bookings" className="btn-secondary px-3 py-1.5 text-xs">View</Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}