'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { productService } from '@/services/api'
import { serviceService } from '@/services/api'

import { FaMagic, FaSpinner } from 'react-icons/fa'
import api from '@/services/api/api'

export default function CreateListingPage() {
 const router = useRouter()
 const [loading, setLoading] = useState(false)
 const [generatingDesc, setGeneratingDesc] = useState(false)
 const [listingType, setListingType] = useState('product')
 const [formData, setFormData] = useState({
 title: '',
 description: '',
 price: '',
 category: '',
 condition: 'New',
 location: '',
 deliveryTime: '2-3 days',
 })

 const generateDescription = async () => {
 if (!formData.title) {
 toast.error('Please enter a title first')
 return
 }
 setGeneratingDesc(true)
 try {
 const res = await api.post('/ai/generate-description', {
 title: formData.title,
 category: formData.category,
 price: formData.price
 })
 if (res.data?.data?.isMock) {
 toast('Using demo description. Configure Gemini API key for real AI.', { icon: '🤖' })
 } else {
 toast.success('Description generated!')
 }
 setFormData({ ...formData, description: res.data.data.description })
 } catch (err: any) {
 toast.error('Failed to generate description')
 } finally {
 setGeneratingDesc(false)
 }
 }

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 setLoading(true)

 try {
 const data = {
 ...formData,
 price: parseFloat(formData.price),
 }

 if (listingType === 'product') {
 await productService.create(data)
 toast.success('Product created successfully!')
 } else {
 await serviceService.create(data)
 toast.success('Service created successfully!')
 }

 router.push('/dashboard')
 } catch (error: any) {
 toast.error(error.response?.data?.error || 'Failed to create listing')
 } finally {
 setLoading(false)
 }
 }

 return (
 <div className="min-h-screen py-20 px-4">
 <div className="container-custom max-w-2xl mx-auto">
 <div className="card p-8">
 <h1 className="text-3xl font-bold gradient-text text-center mb-6">
 Create New Listing
 </h1>

 <div className="flex gap-4 mb-6">
 <button
 onClick={() => setListingType('product')}
 className={listingType === 'product' ? 'btn-primary flex-1 py-2 px-4 rounded-xl' : 'glass text-gray-600 hover:text-white flex-1 py-2 px-4 rounded-xl'}
 >
 Product
 </button>
 <button
 onClick={() => setListingType('service')}
 className={listingType === 'service' ? 'btn-primary flex-1 py-2 px-4 rounded-xl' : 'glass text-gray-600 hover:text-white flex-1 py-2 px-4 rounded-xl'}
 >
 Service
 </button>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-800 mb-2">Title *</label>
 <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="input-field" placeholder="Enter title" />
 </div>

 <div>
 <div className="flex items-center justify-between mb-2">
 <label className="block text-sm font-medium text-gray-800">Description *</label>
 <button
 type="button"
 onClick={generateDescription}
 disabled={generatingDesc}
 className="flex items-center gap-1.5 text-xs bg-teal-500 text-white px-3 py-1 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
 >
 {generatingDesc ? <FaSpinner className="animate-spin" /> : <FaMagic />}
 {generatingDesc ? 'Generating...' : 'AI Generate'}
 </button>
 </div>
 <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input-field" placeholder="Describe your listing..." />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-800 mb-2">Price ($) *</label>
 <input type="number" required step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="input-field" placeholder="0.00" />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-800 mb-2">Category *</label>
 <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="input-field text-white" style={{ color: 'white', appearance: 'auto' }}>
 <option value="" className="text-gray-500">Select category</option>
 <option value="Electronics" className="text-black bg-white">Electronics</option>
 <option value="Clothing" className="text-black bg-white">Clothing</option>
 <option value="Books" className="text-black bg-white">Books</option>
 <option value="Home" className="text-black bg-white">Home</option>
 <option value="Web Development" className="text-black bg-white">Web Development</option>
 <option value="Design" className="text-black bg-white">Design</option>
 <option value="Photography" className="text-black bg-white">Photography</option>
 <option value="Tutoring" className="text-black bg-white">Tutoring</option>
 <option value="Other" className="text-black bg-white">Other</option>
 </select>
 </div>

 {listingType === 'product' && (
 <div>
 <label className="block text-sm font-medium text-gray-800 mb-2">Condition</label>
 <select value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})} className="input-field text-white" style={{ color: 'white', appearance: 'auto' }}>
 <option value="New" className="text-black bg-white">New</option>
 <option value="Like New" className="text-black bg-white">Like New</option>
 <option value="Good" className="text-black bg-white">Good</option>
 <option value="Fair" className="text-black bg-white">Fair</option>
 </select>
 </div>
 )}

 {listingType === 'service' && (
 <div>
 <label className="block text-sm font-medium text-gray-800 mb-2">Delivery Time</label>
 <input type="text" value={formData.deliveryTime} onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})} className="input-field" placeholder="e.g., 2-3 days" />
 </div>
 )}

 <div>
 <label className="block text-sm font-medium text-gray-800 mb-2">Location</label>
 <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="input-field" placeholder="City, State" />
 </div>

 <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">
 {loading ? 'Creating...' : 'Create Listing'}
 </button>
 </form>

 <div className="mt-4 text-center">
 <Link href="/dashboard" className="text-gray-600 hover:text-white transition-colors">
 ← Back to Dashboard
 </Link>
 </div>
 </div>
 </div>
 </div>
 )
}