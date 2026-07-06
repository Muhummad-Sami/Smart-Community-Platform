'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
 FaArrowLeft, FaBox, FaTools, FaCheck, FaTimes, FaTrash, 
 FaSearch
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import api from '@/services/api/api'
import { AdminRoute } from '@/components/shared/AdminRoute'

export default function AdminListingsPage() {
 const { user } = useAuth()
 const [products, setProducts] = useState<any[]>([])
 const [services, setServices] = useState<any[]>([])
 const [loading, setLoading] = useState(true)
 const [activeTab, setActiveTab] = useState<'products' | 'services'>('products')
 const [searchTerm, setSearchTerm] = useState('')

 useEffect(() => {
 if (user && user.role === 'ADMIN') {
 fetchListings()
 }
 }, [user])

 const fetchListings = async () => {
 try {
 const response = await api.get('/admin/listings')
 setProducts(response.data.data.products)
 setServices(response.data.data.services)
 } catch (error) {
 console.error('Error fetching listings:', error)
 toast.error('Failed to load listings')
 } finally {
 setLoading(false)
 }
 }

 const approveListing = async (id: string, type: string) => {
 try {
 await api.put(`/admin/listings/${id}/approve`, { type })
 toast.success('Listing approved successfully')
 fetchListings()
 } catch (error) {
 console.error('Error approving listing:', error)
 toast.error('Failed to approve listing')
 }
 }

 const removeListing = async (id: string, type: string) => {
 if (!confirm('Are you sure you want to remove this listing?')) return
 try {
 await api.delete(`/admin/listings/${id}`, { data: { type } })
 toast.success('Listing removed successfully')
 fetchListings()
 } catch (error) {
 console.error('Error removing listing:', error)
 toast.error('Failed to remove listing')
 }
 }

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="spinner"></div>
 </div>
 )
 }

 const currentListings = activeTab === 'products' ? products : services
 const listingType = activeTab === 'products' ? 'product' : 'service'

 const filteredListings = currentListings.filter((item: any) =>
 item.title?.toLowerCase().includes(searchTerm.toLowerCase())
 )

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
 <FaBox className="text-[#14B8A6]" /> Listing Management
 </h1>
 <p className="text-gray-600">Review, approve, and manage products and services</p>
 </div>
 
 <div className="flex gap-4">
 <div className="card px-5 py-3 flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#34d399] flex items-center justify-center text-white text-lg shadow-lg">
 <FaBox />
 </div>
 <div>
 <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wider">Products</p>
 <p className="text-xl font-bold text-white">{products.length}</p>
 </div>
 </div>
 <div className="card px-5 py-3 flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D9488] to-[#c084fc] flex items-center justify-center text-white text-lg shadow-lg">
 <FaTools />
 </div>
 <div>
 <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wider">Services</p>
 <p className="text-xl font-bold text-white">{services.length}</p>
 </div>
 </div>
 </div>
 </div>

 <div className="card p-0 overflow-hidden flex flex-col">
 {/* Toolbar */}
 <div className="p-5 border-b border-gray-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div className="flex gap-2 p-1 bg-white rounded-xl self-start">
 <button
 onClick={() => setActiveTab('products')}
 className={`px-5 py-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
 activeTab === 'products' ? 'bg-gray-100 text-white shadow-sm' : 'text-gray-600 hover:text-white hover:bg-white'
 }`}
 >
 <FaBox className={activeTab === 'products' ? 'text-[#10b981]' : ''} /> Products
 </button>
 <button
 onClick={() => setActiveTab('services')}
 className={`px-5 py-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
 activeTab === 'services' ? 'bg-gray-100 text-white shadow-sm' : 'text-gray-600 hover:text-white hover:bg-white'
 }`}
 >
 <FaTools className={activeTab === 'services' ? 'text-[#0D9488]' : ''} /> Services
 </button>
 </div>

 <div className="relative w-full max-w-sm">
 <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4b5e7a]" />
 <input
 type="text"
 placeholder={`Search ${activeTab}...`}
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="input-field pl-11 py-2 bg-white border-transparent focus:border-[#14B8A6] focus:bg-gray-100 w-full text-sm"
 />
 </div>
 </div>

 {/* Table */}
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-white border-b border-gray-200">
 <th className="py-4 px-6 text-[11px] font-bold text-gray-600 uppercase tracking-wider">Title</th>
 <th className="py-4 px-6 text-[11px] font-bold text-gray-600 uppercase tracking-wider">Category</th>
 <th className="py-4 px-6 text-[11px] font-bold text-gray-600 uppercase tracking-wider">Price</th>
 <th className="py-4 px-6 text-[11px] font-bold text-gray-600 uppercase tracking-wider">Status</th>
 <th className="py-4 px-6 text-[11px] font-bold text-gray-600 uppercase tracking-wider text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/5">
 {filteredListings.length === 0 ? (
 <tr>
 <td colSpan={5} className="text-center py-12">
 <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4">
 {activeTab === 'products' ? (
 <FaBox className="text-2xl text-[#4b5e7a]" />
 ) : (
 <FaTools className="text-2xl text-[#4b5e7a]" />
 )}
 </div>
 <p className="text-gray-600 font-medium">No {activeTab} found</p>
 </td>
 </tr>
 ) : (
 filteredListings.map((item: any) => (
 <motion.tr
 key={item.id}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="hover:bg-white transition-colors group"
 >
 <td className="py-4 px-6">
 <p className="text-sm font-semibold text-white mb-0.5">{item.title}</p>
 </td>
 <td className="py-4 px-6">
 <span className="text-xs text-gray-600 bg-white px-2.5 py-1 rounded-md">{item.category}</span>
 </td>
 <td className="py-4 px-6">
 <span className="text-sm font-medium text-[#4ade80]">${item.price}</span>
 </td>
 <td className="py-4 px-6">
 <span className={`badge text-[10px] ${
 activeTab === 'products' 
 ? (item.isAvailable ? 'badge-success' : 'badge-warning') 
 : (item.availability ? 'badge-success' : 'badge-warning')
 }`}>
 {activeTab === 'products' ? (item.isAvailable ? 'Active' : 'Pending') : (item.availability ? 'Active' : 'Pending')}
 </span>
 </td>
 <td className="py-4 px-6 text-right">
 <div className="flex items-center justify-end gap-2">
 {(!item.isAvailable && activeTab === 'products') || (!item.availability && activeTab === 'services') ? (
 <button
 onClick={() => approveListing(item.id, listingType)}
 className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
 >
 <FaCheck /> Approve
 </button>
 ) : null}
 <button
 onClick={() => removeListing(item.id, listingType)}
 className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-colors"
 >
 <FaTrash /> Remove
 </button>
 </div>
 </td>
 </motion.tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </div>
 </AdminRoute>
 )
}