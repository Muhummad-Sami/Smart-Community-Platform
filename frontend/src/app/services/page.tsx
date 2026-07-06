'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { serviceService } from '@/services/api'
import {
 FaSearch, FaFilter, FaTimes, FaClock, FaTag,
 FaStar, FaArrowRight, FaTools, FaHeart, FaRegHeart,
 FaCheckCircle, FaTimesCircle
} from 'react-icons/fa'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api/api'
import { toast } from 'react-hot-toast'

const CATEGORIES = [
 'All', 'Web Development', 'Graphic Design', 'Photography',
 'Home Services', 'Tutoring', 'Content Writing',
 'Digital Marketing', 'Video Editing', 'Other'
]
const SORT_OPTIONS = [
 { value: 'newest', label: 'Newest First' },
 { value: 'price_asc', label: 'Price: Low to High' },
 { value: 'price_desc', label: 'Price: High to Low' },
]

const CATEGORY_ICONS: Record<string, string> = {
 'Web Development': '💻', 'Graphic Design': '🎨', 'Photography': '📷',
 'Home Services': '🏠', 'Tutoring': '📚', 'Content Writing': '✍️',
 'Digital Marketing': '📣', 'Video Editing': '🎬', 'Other': '🔧',
}

function ServiceSkeleton() {
 return (
 <div className="glass rounded-2xl p-5 space-y-3">
 <div className="flex gap-3">
 <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0" />
 <div className="flex-1 space-y-2">
 <div className="skeleton h-5 w-3/4" />
 <div className="skeleton h-4 w-1/2" />
 </div>
 </div>
 <div className="skeleton h-4 w-full" />
 <div className="skeleton h-4 w-5/6" />
 <div className="flex justify-between items-center pt-2">
 <div className="skeleton h-6 w-20" />
 <div className="skeleton h-8 w-24 rounded-lg" />
 </div>
 </div>
 )
}

export default function ServicesPage() {
 const router = useRouter()
 const { user } = useAuth()
 const [services, setServices] = useState<any[]>([])
 const [loading, setLoading] = useState(true)
 const [search, setSearch] = useState('')
 const [category, setCategory] = useState('All')
 const [sort, setSort] = useState('newest')
 const [priceMax, setPriceMax] = useState<number | ''>('')
 const [availableOnly, setAvailableOnly] = useState(false)
 const [showFilters, setShowFilters] = useState(false)
 const [favorites, setFavorites] = useState<Set<string>>(new Set())
 const [recommendations, setRecommendations] = useState<any[]>([])
 const [aiMessage, setAiMessage] = useState('')

 useEffect(() => { 
 fetchServices() 
 if (user) fetchRecommendations()
 }, [user])

 const fetchRecommendations = async () => {
 try {
 const res = await api.get('/ai/recommendations')
 setRecommendations(res.data.data.services)
 setAiMessage(res.data.data.message)
 } catch {
 // fail silently
 }
 }

 const fetchServices = async () => {
 try {
 const response = await serviceService.getAll()
 setServices(response.data || [])
 } catch {
 toast.error('Failed to load services')
 } finally {
 setLoading(false)
 }
 }

 const toggleFavorite = async (e: React.MouseEvent, serviceId: string) => {
 e.stopPropagation()
 if (!user) { toast.error('Login to save favorites'); return }
 try {
 if (favorites.has(serviceId)) {
 setFavorites(prev => { const s = new Set(prev); s.delete(serviceId); return s })
 } else {
 await api.post('/services/' + serviceId + '/favorite')
 setFavorites(prev => new Set(prev).add(serviceId))
 toast.success('Added to favorites!')
 }
 } catch { toast.error('Failed to update favorite') }
 }

 const filtered = useMemo(() => {
 let result = [...services]
 if (search.trim()) {
 const q = search.toLowerCase()
 result = result.filter(s =>
 s.title?.toLowerCase().includes(q) ||
 s.description?.toLowerCase().includes(q) ||
 s.category?.toLowerCase().includes(q)
 )
 }
 if (category !== 'All') result = result.filter(s => s.category === category)
 if (priceMax !== '') result = result.filter(s => s.price <= Number(priceMax))
 if (availableOnly) result = result.filter(s => s.availability)
 if (sort === 'price_asc') result.sort((a, b) => a.price - b.price)
 else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price)
 else result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
 return result
 }, [services, search, category, sort, priceMax, availableOnly])

 const clearFilters = () => { setSearch(''); setCategory('All'); setPriceMax(''); setSort('newest'); setAvailableOnly(false) }
 const hasFilters = search || category !== 'All' || priceMax !== '' || sort !== 'newest' || availableOnly

 return (
 <div className="min-h-screen py-24 px-4">
 <div className="container-custom max-w-6xl">
 <div className="text-center mb-10 md:mb-16">
 <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-extrabold text-primary-900 mb-4">
 Discover <span className="text-primary-500">Services</span>
 </motion.h1>
 <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-primary-800 text-lg max-w-2xl mx-auto">
 Find the perfect professional for your needs
 </motion.p>
 </div>

 {/* AI Recommendations Section */}
 {recommendations.length > 0 && !search && category === 'All' && (
 <div className="mb-16">
 <div className="flex items-center gap-3 mb-6">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14B8A6]/20 to-[#14B8A6]/20 flex items-center justify-center border border-gray-200 shadow-lg">
 <span className="text-lg">🤖</span>
 </div>
 <div>
 <h2 className="text-xl font-bold text-primary-900 flex items-center gap-2">AI Recommended for You</h2>
 <p className="text-sm text-gray-600">{aiMessage}</p>
 </div>
 </div>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {recommendations.slice(0, 3).map((service: any, i: number) => (
 <motion.div
 key={service.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: i * 0.05 }}
 className="glass rounded-2xl p-5 group cursor-pointer hover:border-white/12 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-[#14B8A6]/30"
 onClick={() => router.push('/services/' + service.id)}
 >
 <div className="flex items-start justify-between gap-3 mb-3">
 <div className="flex items-center gap-3 min-w-0">
 <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#14B8A6]/20 to-[#14B8A6]/20 border border-gray-200 flex items-center justify-center text-2xl flex-shrink-0">
 {CATEGORY_ICONS[service.category] || '🔧'}
 </div>
 <div className="min-w-0">
 <h3 className="font-semibold text-white text-sm leading-tight group-hover:text-[#a78bfa] transition-colors line-clamp-1">
 {service.title}
 </h3>
 <span className="text-xs text-gray-600">{service.category}</span>
 </div>
 </div>
 <button
 onClick={e => toggleFavorite(e, service.id)}
 className="w-8 h-8 rounded-xl bg-white hover:bg-gray-100 flex items-center justify-center transition-all flex-shrink-0"
 >
 {favorites.has(service.id) ? <FaHeart className="text-red-400 text-xs" /> : <FaRegHeart className="text-gray-600 text-xs" />}
 </button>
 </div>
 <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">{service.description}</p>
 <div className="flex items-center justify-between pt-3 border-t border-gray-200">
 <span className="text-lg font-bold gradient-text">${service.price}</span>
 <button
 onClick={e => { e.stopPropagation(); router.push('/services/' + service.id) }}
 className="btn-primary text-xs px-3 py-1.5"
 >
 View <FaArrowRight className="text-[10px]" />
 </button>
 </div>
 </motion.div>
 ))}
 </div>
 </div>
 )}

 {/* Category Pills */}
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: 0.1 }}
 className="flex flex-wrap gap-2 mb-5 justify-center"
 >
 {CATEGORIES.map(cat => (
 <button
 key={cat}
 onClick={() => setCategory(cat)}
 className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
 category === cat
 ? 'bg-primary-500 border-primary-500 text-cream-50 shadow-lg'
 : 'bg-bg-elevated border-border text-primary-900 hover:bg-bg-base hover:text-primary-800'
 }`}
 >
 {cat !== 'All' && CATEGORY_ICONS[cat] && <span className="mr-1">{CATEGORY_ICONS[cat]}</span>}
 {cat}
 </button>
 ))}
 </motion.div>

 {/* Search + Filter Bar */}
 <motion.div
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, delay: 0.15 }}
 className="glass rounded-2xl p-4 mb-6"
 >
 <div className="flex flex-col md:flex-row gap-3">
 <div className="relative flex-1">
 <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4b5e7a] text-sm" />
 <input
 type="text"
 placeholder="Search services by name, description, or category..."
 value={search}
 onChange={e => setSearch(e.target.value)}
 className="input-field pl-11"
 />
 </div>
 <select value={sort} onChange={e => setSort(e.target.value)} className="input-field md:w-52">
 {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
 </select>
 <button
 onClick={() => setShowFilters(!showFilters)}
 className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-gray-100' : ''}`}
 >
 <FaFilter className="text-xs" /> More Filters
 </button>
 </div>

 <AnimatePresence>
 {showFilters && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="overflow-hidden"
 >
 <div className="pt-4 mt-4 border-t border-gray-200 flex flex-wrap gap-4 items-end">
 <div className="min-w-40">
 <label className="text-xs text-gray-600 mb-1.5 block font-medium">Max Price ($)</label>
 <input
 type="number"
 placeholder="Any price"
 value={priceMax}
 onChange={e => setPriceMax(e.target.value === '' ? '' : Number(e.target.value))}
 className="input-field"
 min={0}
 />
 </div>
 <label className="flex items-center gap-2 cursor-pointer pb-1">
 <div
 onClick={() => setAvailableOnly(!availableOnly)}
 className={`w-10 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 ${availableOnly ? 'bg-[#14B8A6]' : 'bg-gray-100'}`}
 >
 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${availableOnly ? 'left-5' : 'left-1'}`} />
 </div>
 <span className="text-sm text-gray-600">Available only</span>
 </label>
 {hasFilters && (
 <button onClick={clearFilters} className="flex items-center gap-2 text-sm text-[#f87171] hover:text-red-300 transition-colors pb-1">
 <FaTimes className="text-xs" /> Clear all
 </button>
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </motion.div>

 {/* Results */}
 <div className="flex items-center justify-between mb-5">
 <p className="text-sm text-gray-600">
 {loading ? 'Loading...' : `${filtered.length} service${filtered.length !== 1 ? 's' : ''} found`}
 </p>
 </div>

 {loading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {Array.from({ length: 6 }).map((_, i) => <ServiceSkeleton key={i} />)}
 </div>
 ) : filtered.length === 0 ? (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
 <div className="w-20 h-20 mx-auto rounded-2xl bg-white flex items-center justify-center mb-4">
 <FaTools className="text-4xl text-[#4b5e7a]" />
 </div>
 <h3 className="text-xl font-semibold text-primary-900 mb-2">No services found</h3>
 <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
 <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
 </motion.div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {filtered.map((service, i) => (
 <motion.div
 key={service.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
 className="glass rounded-2xl p-5 group cursor-pointer hover:border-white/12 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
 onClick={() => router.push('/services/' + service.id)}
 >
 {/* Top row */}
 <div className="flex items-start justify-between gap-3 mb-3">
 <div className="flex items-center gap-3 min-w-0">
 <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#14B8A6]/20 to-[#14B8A6]/20 border border-gray-200 flex items-center justify-center text-2xl flex-shrink-0">
 {CATEGORY_ICONS[service.category] || '🔧'}
 </div>
 <div className="min-w-0">
 <h3 className="font-semibold text-white text-sm leading-tight group-hover:text-[#a78bfa] transition-colors line-clamp-1">
 {service.title}
 </h3>
 <span className="text-xs text-gray-600">{service.category}</span>
 </div>
 </div>
 <button
 onClick={e => toggleFavorite(e, service.id)}
 className="w-8 h-8 rounded-xl bg-white hover:bg-gray-100 flex items-center justify-center transition-all flex-shrink-0"
 >
 {favorites.has(service.id) ? <FaHeart className="text-red-400 text-xs" /> : <FaRegHeart className="text-gray-600 text-xs" />}
 </button>
 </div>

 <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">{service.description}</p>

 {/* Meta */}
 <div className="flex flex-wrap gap-2 mb-4">
 {service.deliveryTime && (
 <div className="flex items-center gap-1.5 text-xs text-gray-600">
 <FaClock className="text-[#14B8A6] text-[10px]" />
 <span>{service.deliveryTime}</span>
 </div>
 )}
 <div className="flex items-center gap-1.5 text-xs">
 {service.availability ? (
 <><FaCheckCircle className="text-[#4ade80] text-[10px]" /><span className="text-[#4ade80]">Available</span></>
 ) : (
 <><FaTimesCircle className="text-[#f87171] text-[10px]" /><span className="text-[#f87171]">Unavailable</span></>
 )}
 </div>
 </div>

 {/* Price + Action */}
 <div className="flex items-center justify-between pt-3 border-t border-gray-200">
 <div>
 <span className="text-lg font-bold gradient-text">${service.price}</span>
 {service.deliveryTime && <span className="text-xs text-[#4b5e7a] ml-1">/ project</span>}
 </div>
 <button
 onClick={e => { e.stopPropagation(); router.push('/services/' + service.id) }}
 className="btn-primary text-xs px-3 py-1.5"
 >
 Book Now <FaArrowRight className="text-[10px]" />
 </button>
 </div>
 </motion.div>
 ))}
 </div>
 )}
 </div>
 </div>
 )
}