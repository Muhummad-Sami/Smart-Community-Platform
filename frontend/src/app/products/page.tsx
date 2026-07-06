'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { productService } from '@/services/api'
import {
 FaSearch, FaFilter, FaTimes, FaTag, FaMapMarkerAlt,
 FaHeart, FaRegHeart, FaBox, FaArrowRight, FaSortAmountDown
} from 'react-icons/fa'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api/api'
import { toast } from 'react-hot-toast'

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Furniture', 'Sports', 'Toys', 'Food', 'Tools', 'Other']
const SORT_OPTIONS = [
 { value: 'newest', label: 'Newest First' },
 { value: 'price_asc', label: 'Price: Low to High' },
 { value: 'price_desc', label: 'Price: High to Low' },
]

function ProductSkeleton() {
 return (
 <div className="glass rounded-2xl overflow-hidden">
 <div className="skeleton h-48 w-full" />
 <div className="p-5 space-y-3">
 <div className="skeleton h-5 w-3/4" />
 <div className="skeleton h-4 w-full" />
 <div className="skeleton h-4 w-1/2" />
 <div className="flex justify-between items-center pt-2">
 <div className="skeleton h-6 w-20" />
 <div className="skeleton h-8 w-24 rounded-lg" />
 </div>
 </div>
 </div>
 )
}

export default function ProductsPage() {
 const router = useRouter()
 const { user } = useAuth()
 const [products, setProducts] = useState<any[]>([])
 const [loading, setLoading] = useState(true)
 const [search, setSearch] = useState('')
 const [category, setCategory] = useState('All')
 const [sort, setSort] = useState('newest')
 const [priceMax, setPriceMax] = useState<number | ''>('')
 const [showFilters, setShowFilters] = useState(false)
 const [favorites, setFavorites] = useState<Set<string>>(new Set())

 useEffect(() => { fetchProducts() }, [])

 const fetchProducts = async () => {
 try {
 const response = await productService.getAll()
 setProducts(response.data || [])
 } catch {
 toast.error('Failed to load products')
 } finally {
 setLoading(false)
 }
 }

 const toggleFavorite = async (e: React.MouseEvent, productId: string) => {
 e.stopPropagation()
 if (!user) { toast.error('Login to save favorites'); return }
 try {
 if (favorites.has(productId)) {
 setFavorites(prev => { const s = new Set(prev); s.delete(productId); return s })
 } else {
 await api.post('/products/' + productId + '/favorite')
 setFavorites(prev => new Set(prev).add(productId))
 toast.success('Added to favorites!')
 }
 } catch { toast.error('Failed to update favorite') }
 }

 const filtered = useMemo(() => {
 let result = [...products]
 if (search.trim()) {
 const q = search.toLowerCase()
 result = result.filter(p =>
 p.title?.toLowerCase().includes(q) ||
 p.description?.toLowerCase().includes(q) ||
 p.location?.toLowerCase().includes(q)
 )
 }
 if (category !== 'All') result = result.filter(p => p.category === category)
 if (priceMax !== '') result = result.filter(p => p.price <= Number(priceMax))
 if (sort === 'price_asc') result.sort((a, b) => a.price - b.price)
 else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price)
 else result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
 return result
 }, [products, search, category, sort, priceMax])

 const clearFilters = () => { setSearch(''); setCategory('All'); setPriceMax(''); setSort('newest') }
 const hasFilters = search || category !== 'All' || priceMax !== '' || sort !== 'newest'

 return (
 <div className="min-h-screen py-24 px-4">
 <div className="container-custom">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: 24 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="text-center mb-10"
 >
 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-border text-primary-500 text-sm font-medium mb-4">
 <FaBox className="text-xs" />
 Community Marketplace
 </div>
 <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-3">Browse Products</h1>
 <p className="text-primary-800 text-lg max-w-xl mx-auto">Discover quality products from your local community</p>
 </motion.div>

 {/* Search + Filter Bar */}
 <motion.div
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, delay: 0.1 }}
 className="glass rounded-2xl p-4 mb-6"
 >
 <div className="flex flex-col md:flex-row gap-3">
 {/* Search */}
 <div className="relative flex-1">
 <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4b5e7a] text-sm" />
 <input
 type="text"
 placeholder="Search products, categories, locations..."
 value={search}
 onChange={e => setSearch(e.target.value)}
 className="input-field pl-11"
 />
 </div>

 {/* Category Select */}
 <select
 value={category}
 onChange={e => setCategory(e.target.value)}
 className="input-field md:w-44"
 >
 {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
 </select>

 {/* Sort */}
 <select
 value={sort}
 onChange={e => setSort(e.target.value)}
 className="input-field md:w-48"
 >
 {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
 </select>

 {/* Filter Toggle */}
 <button
 onClick={() => setShowFilters(!showFilters)}
 className={`btn-secondary flex items-center gap-2 md:w-auto ${showFilters ? 'bg-gray-100' : ''}`}
 >
 <FaFilter className="text-xs" /> Filters
 </button>
 </div>

 {/* Advanced Filters */}
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
 <div className="flex-1 min-w-40">
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
 {hasFilters && (
 <button onClick={clearFilters} className="flex items-center gap-2 text-sm text-[#f87171] hover:text-red-300 transition-colors pb-1">
 <FaTimes className="text-xs" /> Clear all filters
 </button>
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </motion.div>

 {/* Results Count */}
 <div className="flex items-center justify-between mb-5">
 <p className="text-sm text-gray-600">
 {loading ? 'Loading...' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`}
 </p>
 {hasFilters && !loading && (
 <button onClick={clearFilters} className="text-xs text-[#60a5fa] hover:text-[#a78bfa] transition-colors flex items-center gap-1">
 <FaTimes className="text-[10px]" /> Clear filters
 </button>
 )}
 </div>

 {/* Products Grid */}
 {loading ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
 {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
 </div>
 ) : filtered.length === 0 ? (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="text-center py-20"
 >
 <div className="w-20 h-20 mx-auto rounded-2xl bg-bg-elevated flex items-center justify-center mb-4">
 <FaBox className="text-4xl text-text-muted" />
 </div>
 <h3 className="text-xl font-semibold text-primary-900 mb-2">No products found</h3>
 <p className="text-primary-800 mb-6">Try adjusting your search or filters</p>
 <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
 </motion.div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
 {filtered.map((product, i) => (
 <motion.div
 key={product.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
 className="glass rounded-2xl overflow-hidden group cursor-pointer"
 style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease' }}
 onClick={() => router.push('/products/' + product.id)}
 >
 {/* Image Area */}
 <div className="relative h-44 bg-gradient-to-br from-primary-900 to-primary-800 overflow-hidden">
 <div className="absolute inset-0 flex items-center justify-center opacity-20">
 <FaBox className="text-7xl text-primary-500" />
 </div>
 {product.images && (() => {
 try {
 const imgs = JSON.parse(product.images)
 if (imgs.length > 0) return (
 <img src={imgs[0]} alt={product.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
 )
 } catch {}
 return null
 })()}
 {/* Favorite Button */}
 <button
 onClick={e => toggleFavorite(e, product.id)}
 className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-bg-elevated/80 flex items-center justify-center text-primary-900 hover:bg-bg-elevated transition-all duration-200 hover:scale-110"
 >
 {favorites.has(product.id) ? <FaHeart className="text-red-400 text-sm" /> : <FaRegHeart className="text-sm" />}
 </button>
 {/* Category Badge */}
 <div className="absolute bottom-3 left-3">
 <span className="badge-primary text-[10px]">{product.category}</span>
 </div>
 </div>

 {/* Content */}
 <div className="p-5">
 <h3 className="font-semibold text-primary-900 text-base leading-tight mb-1 group-hover:text-primary-800 transition-colors line-clamp-1">
 {product.title}
 </h3>
 <p className="text-primary-800 text-sm line-clamp-2 mb-3 leading-relaxed">
 {product.description}
 </p>

 {product.location && (
 <div className="flex items-center gap-1.5 text-[#4b5e7a] text-xs mb-3">
 <FaMapMarkerAlt className="text-[10px]" />
 <span>{product.location}</span>
 </div>
 )}

 <div className="flex items-center justify-between">
 <div>
 <span className="text-xl font-bold gradient-text">${product.price}</span>
 {product.condition && (
 <span className="ml-2 text-xs text-gray-600 font-medium">{product.condition}</span>
 )}
 </div>
 <button
 onClick={e => { e.stopPropagation(); router.push('/products/' + product.id) }}
 className="btn-primary text-xs px-3 py-1.5"
 >
 View <FaArrowRight className="text-[10px]" />
 </button>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 )}

 {/* Empty State CTA */}
 {!loading && products.length === 0 && (
 <div className="text-center mt-12">
 <Link href="/create-listing" className="btn-primary px-8 py-3">
 List Your First Product
 </Link>
 </div>
 )}
 </div>
 </div>
 )
}