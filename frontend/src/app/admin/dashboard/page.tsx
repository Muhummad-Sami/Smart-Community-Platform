'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FaUsers, FaBox, FaTools, FaCalendarCheck, 
  FaStar, FaExclamationTriangle, FaShieldAlt,
  FaShoppingBag, FaComments, FaArrowRight, FaChartLine
} from 'react-icons/fa'
import api from '@/services/api/api'
import { AdminRoute } from '@/components/shared/AdminRoute'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchStats()
  }, [user])

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats')
      setStats(response.data.data.stats)
      setRecentActivity(response.data.data.recentActivity)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="spinner"></div>
      </div>
    )
  }

  const statItems = [
    { icon: <FaUsers />, label: 'Users', value: stats?.totalUsers || 0, iconClass: 'text-primary-500', link: '/admin/users' },
    { icon: <FaBox />, label: 'Products', value: stats?.totalProducts || 0, iconClass: 'text-primary-600', link: '/admin/listings' },
    { icon: <FaTools />, label: 'Services', value: stats?.totalServices || 0, iconClass: 'text-primary-700', link: '/admin/listings' },
    { icon: <FaCalendarCheck />, label: 'Bookings', value: stats?.totalBookings || 0, iconClass: 'text-primary-500', link: '/admin/bookings' },
    { icon: <FaStar />, label: 'Reviews', value: stats?.totalReviews || 0, iconClass: 'text-primary-600', link: '/admin/reviews' },
    { icon: <FaExclamationTriangle />, label: 'Reports', value: stats?.reportedReviews || 0, iconClass: 'text-red-500', link: '/admin/reviews' },
  ]

  const quickLinks = [
    { icon: <FaUsers />, label: 'Manage Users', link: '/admin/users' },
    { icon: <FaShoppingBag />, label: 'Listings', link: '/admin/listings' },
    { icon: <FaCalendarCheck />, label: 'Bookings', link: '/admin/bookings' },
    { icon: <FaComments />, label: 'Reviews', link: '/admin/reviews' },
    { icon: <FaChartLine />, label: 'Analytics', link: '/admin/analytics' },
  ]

  return (
    <AdminRoute>
      <div className="min-h-screen py-24 px-4 bg-background">
        <div className="container-custom max-w-7xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center text-cream-100 text-2xl shadow-lg">
              <FaShieldAlt />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary-900 mb-1">Admin Control Panel</h1>
              <p className="text-primary-800">System overview and management tools</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {statItems.map((stat, i) => (
              <Link href={stat.link} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="card p-5 text-center group cursor-pointer relative overflow-hidden h-full flex flex-col justify-center hover:border-primary-500 transition-all"
                >
                  <div className={`text-3xl mx-auto mb-3 ${stat.iconClass} transform group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-primary-900 mb-1">{stat.value}</div>
                  <div className="text-[11px] font-bold text-primary-800 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Links */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
                <FaChartLine className="text-primary-500" /> Quick Management
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                {quickLinks.map((link, i) => (
                  <Link href={link.link} key={i}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="card p-4 flex items-center gap-4 group transition-all duration-300 hover:border-primary-500"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-lg text-primary-500 group-hover:bg-primary-500 group-hover:text-cream-100 transition-all">
                        {link.icon}
                      </div>
                      <span className="font-medium text-primary-900 group-hover:text-primary-800 transition-colors flex-1">{link.label}</span>
                      <FaArrowRight className="text-xs text-primary-500 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <div className="card p-0 flex flex-col overflow-hidden">
                <div className="p-5 border-b border-border flex justify-between items-center bg-surface">
                  <h3 className="font-semibold text-primary-900">Recent Bookings</h3>
                  <Link href="/admin/bookings" className="text-xs text-primary-500 hover:text-primary-900 font-semibold transition-colors">View all</Link>
                </div>
                <div className="p-5 flex-1 bg-background">
                  {recentActivity?.bookings?.length === 0 ? (
                    <p className="text-primary-800 text-center text-sm py-4">No recent bookings</p>
                  ) : (
                    <div className="space-y-3">
                      {recentActivity?.bookings?.slice(0, 5).map((booking: any) => (
                        <div key={booking.id} className="flex justify-between items-center p-3 rounded-xl bg-surface border border-border hover:border-primary-400 transition-colors">
                          <div className="min-w-0 flex-1 mr-3">
                            <p className="text-sm font-semibold text-primary-900 truncate mb-0.5">{booking.service?.title || 'Service'}</p>
                            <p className="text-[10px] text-primary-800 truncate">
                              {booking.client?.fullName} <FaArrowRight className="inline mx-1 text-[8px]" /> {booking.provider?.fullName}
                            </p>
                          </div>
                          <span className={`badge ${
                            booking.status === 'PENDING' ? 'badge-warning' :
                            booking.status === 'COMPLETED' ? 'badge-success' :
                            'badge-secondary'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Users */}
              <div className="card p-0 flex flex-col overflow-hidden">
                <div className="p-5 border-b border-border flex justify-between items-center bg-surface">
                  <h3 className="font-semibold text-primary-900">New Users</h3>
                  <Link href="/admin/users" className="text-xs text-primary-500 hover:text-primary-900 font-semibold transition-colors">View all</Link>
                </div>
                <div className="p-5 flex-1 bg-background">
                  {recentActivity?.users?.length === 0 ? (
                    <p className="text-primary-800 text-center text-sm py-4">No recent users</p>
                  ) : (
                    <div className="space-y-3">
                      {recentActivity?.users?.slice(0, 5).map((u: any) => (
                        <div key={u.id} className="flex justify-between items-center p-3 rounded-xl bg-surface border border-border hover:border-primary-400 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-cream-100 font-bold text-xs flex-shrink-0">
                              {u.fullName?.charAt(0) || 'U'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-primary-900 truncate">{u.fullName}</p>
                              <p className="text-[10px] text-primary-800 truncate">{u.email}</p>
                            </div>
                          </div>
                          <span className={`badge text-[9px] ${u.role === 'PROVIDER' ? 'badge-info' : 'badge-secondary'}`}>
                            {u.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  )
}