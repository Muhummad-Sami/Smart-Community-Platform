'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  FaUser, FaTools, FaCalendarCheck, FaSignOutAlt,
  FaStar, FaDollarSign, FaPlus, FaArrowRight, FaBoxOpen,
  FaEdit, FaTrash, FaBox, FaEye
} from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import api from '@/services/api/api'
import { toast } from 'react-hot-toast'
import { productService } from '@/services/api'

export default function ProviderDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [stats, setStats] = useState({ services: 0, bookings: 0, earnings: 0, reviews: 0, products: 0 })
  const [bookings, setBookings] = useState<any[]>([])
  const [myProducts, setMyProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (user) { fetchStats(); fetchBookings(); fetchMyProducts() }
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
    } catch (error) {} finally { setLoading(false) }
  }

  const fetchMyProducts = async () => {
    try {
      // Use the profile/listings endpoint which already filters by current user
      const response = await api.get('/users/profile/listings')
      const data = response.data.data || {}
      setMyProducts(data.products || [])
    } catch (error) {}
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    setDeletingId(productId)
    try {
      await productService.delete(productId)
      setMyProducts(prev => prev.filter(p => p.id !== productId))
      toast.success('Product deleted')
    } catch {
      toast.error('Failed to delete product')
    } finally {
      setDeletingId(null)
    }
  }

  const handleLogout = () => { logout(); router.push('/') }

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

  if (user.role === 'USER') { router.push('/dashboard'); return null }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="spinner"></div>
      </div>
    )
  }

  const statItems = [
    { icon: <FaTools />, label: 'My Services', value: stats.services, color: 'from-primary-500 to-primary-600' },
    { icon: <FaBox />, label: 'My Products', value: stats.products ?? myProducts.length, color: 'from-primary-600 to-primary-700' },
    { icon: <FaCalendarCheck />, label: 'Bookings', value: stats.bookings, color: 'from-primary-400 to-primary-500' },
    { icon: <FaStar />, label: 'Reviews', value: stats.reviews, color: 'from-primary-700 to-primary-900' },
  ]

  const pendingBookings = bookings.filter((b: any) => b.status === 'PENDING')

  return (
    <div className="min-h-screen py-24 px-4 bg-background">
      <div className="container-custom max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-900 mb-1">
              Welcome back, <span className="text-primary-500">{user.fullName}</span>
            </h1>
            <p className="text-primary-800">Provider Dashboard — Manage your services, products and incoming requests</p>
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

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
        >
          {statItems.map((stat, i) => (
            <div key={i} className="stat-card flex flex-col items-center justify-center p-6 gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-cream-100 text-xl shadow-lg`}>
                {stat.icon}
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-900 mb-1">{stat.value}</div>
                <div className="text-primary-800 text-xs font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Actions + Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">Management</h3>
              <div className="space-y-3">
                <Link href="/create-listing" className="btn-primary w-full justify-between px-5">
                  <span className="flex items-center gap-2"><FaPlus /> Create Listing</span>
                  <FaArrowRight className="text-xs opacity-70" />
                </Link>
                <Link href="/services" className="btn-secondary w-full justify-between px-5">
                  <span className="flex items-center gap-2"><FaTools /> My Services</span>
                  <FaArrowRight className="text-xs opacity-70" />
                </Link>
                <Link href="/products" className="btn-secondary w-full justify-between px-5">
                  <span className="flex items-center gap-2"><FaBox /> Browse Products</span>
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
              <h3 className="text-lg font-semibold text-primary-900">Pending Requests</h3>
              {pendingBookings.length > 5 && (
                <Link href="/bookings" className="text-sm text-primary-500 hover:text-primary-900 font-semibold transition-colors">View all</Link>
              )}
            </div>
            <div className="flex-1 p-6 bg-background">
              {pendingBookings.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
                    <FaBoxOpen className="text-2xl text-primary-500" />
                  </div>
                  <p className="text-primary-800 mb-1">You have no pending booking requests.</p>
                  <p className="text-primary-800 text-sm">New requests will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingBookings.slice(0, 5).map((booking: any) => (
                    <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border hover:border-primary-400 transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-primary-900 mb-1 truncate">{booking.service?.title || 'Service'}</div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-primary-800">
                          <span className="flex items-center gap-1.5"><FaUser className="text-primary-500" /> {booking.client?.fullName || 'Unknown Client'}</span>
                          <span className="flex items-center gap-1.5"><FaCalendarCheck className="text-primary-500" /> {new Date(booking.dateTime).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="badge badge-warning">PENDING</span>
                        <Link href="/bookings" className="btn-primary px-4 py-2 text-xs hover:text-[#FBF5DD]">Review</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* My Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="card p-0 overflow-hidden"
        >
          <div className="p-6 border-b border-border flex items-center justify-between bg-surface">
            <h3 className="text-lg font-semibold text-primary-900 flex items-center gap-2">
              <FaBox className="text-primary-500" /> My Products
            </h3>
            <Link href="/create-listing" className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
              <FaPlus /> Add Product
            </Link>
          </div>

          {myProducts.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center bg-background">
              <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
                <FaBox className="text-2xl text-primary-500" />
              </div>
              <p className="text-primary-900 font-semibold mb-1">No products yet</p>
              <p className="text-primary-800 text-sm mb-4">Create your first product listing to start selling</p>
              <Link href="/create-listing" className="btn-primary px-6 py-2 flex items-center gap-2">
                <FaPlus /> Create Product
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border bg-background">
              {myProducts.map((product: any) => {
                let firstImg: string | null = null
                try {
                  const imgs = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
                  firstImg = Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : null
                } catch {}

                return (
                  <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-surface/50 transition-colors">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface border border-border flex-shrink-0">
                      {firstImg
                        ? <img src={firstImg} alt={product.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><FaBox className="text-primary-500 text-xl" /></div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-primary-900 truncate">{product.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-primary-500 font-bold">${product.price}</span>
                        <span className="badge-secondary">{product.category}</span>
                        {product.isAvailable
                          ? <span className="badge-success">Available</span>
                          : <span className="badge-danger">Unavailable</span>
                        }
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={'/products/' + product.id}
                        className="p-2 rounded-lg text-primary-800 hover:text-primary-900 hover:bg-surface transition-colors"
                        title="View"
                      >
                        <FaEye />
                      </Link>
                      <Link
                        href={'/products/' + product.id + '/edit'}
                        className="p-2 rounded-lg text-primary-800 hover:text-primary-900 hover:bg-surface transition-colors"
                        title="Edit"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deletingId === product.id}
                        className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}