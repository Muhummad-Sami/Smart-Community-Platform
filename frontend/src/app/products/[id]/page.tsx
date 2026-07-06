'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FaUser, FaMapMarker, FaTag, FaHeart, FaRegHeart, FaArrowLeft, FaStar, FaEnvelope } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { productService } from '@/services/api'
import { useAuth } from '@/context/AuthContext'

export default function ProductDetailsPage() {
 const params = useParams()
 const router = useRouter()
 const { user } = useAuth()
 const [product, setProduct] = useState<any>(null)
 const [loading, setLoading] = useState(true)
 const [isFavorite, setIsFavorite] = useState(false)
 const [currentImage, setCurrentImage] = useState(0)

 const productId = params?.id as string

 useEffect(() => {
 if (productId) {
 fetchProduct()
 }
 }, [productId])

 const fetchProduct = async () => {
 try {
 const response = await productService.getById(productId)
 setProduct(response.data)
 
 if (response.data.images && typeof response.data.images === 'string') {
 try {
 const parsed = JSON.parse(response.data.images)
 response.data.images = parsed
 } catch {
 response.data.images = [response.data.images]
 }
 }
 } catch (error) {
 console.error('Error fetching product:', error)
 toast.error('Product not found')
 router.push('/products')
 } finally {
 setLoading(false)
 }
 }

 const toggleFavorite = () => {
 setIsFavorite(!isFavorite)
 toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites')
 }

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="spinner"></div>
 </div>
 )
 }

 if (!product) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="text-center">
 <h2 className="text-2xl font-bold text-white mb-4">Product Not Found</h2>
 <Link href="/products" className="btn-primary">Back to Products</Link>
 </div>
 </div>
 )
 }

 const imageList = product.images && Array.isArray(product.images) 
 ? product.images 
 : ['https://via.placeholder.com/600x400?text=No+Image']

 return (
 <div className="min-h-screen py-20 px-4">
 <div className="container-custom max-w-5xl mx-auto">
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 >
 <Link href="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-white transition-colors mb-6">
 <FaArrowLeft /> Back to Products
 </Link>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {/* Product Images */}
 <div className="card p-4">
 <div className="relative aspect-square rounded-xl overflow-hidden bg-dark/50">
 <img
 src={imageList[currentImage] || 'https://via.placeholder.com/600x400?text=No+Image'}
 alt={product.title}
 className="w-full h-full object-cover"
 />
 {product.isAvailable && (
 <span className="absolute top-4 right-4 badge-success">Available</span>
 )}
 </div>
 
 {imageList.length > 1 && (
 <div className="flex gap-2 mt-4 overflow-x-auto">
 {imageList.map((img: string, index: number) => (
 <button
 key={index}
 onClick={() => setCurrentImage(index)}
 className={'w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ' + (currentImage === index ? 'border-[#14B8A6]' : 'border-transparent')}
 >
 <img src={img} alt={'Thumbnail ' + (index + 1)} className="w-full h-full object-cover" />
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Product Info */}
 <div className="card p-8">
 <div className="flex justify-between items-start">
 <h1 className="text-3xl font-bold gradient-text">{product.title}</h1>
 <button onClick={toggleFavorite} className="p-2 glass rounded-full hover:scale-110 transition-all duration-300">
 {isFavorite ? <FaHeart className="text-red-500 text-xl" /> : <FaRegHeart className="text-gray-600 text-xl" />}
 </button>
 </div>

 <div className="flex items-center gap-4 mt-2">
 <span className="badge-primary">{product.category}</span>
 <span className="badge-secondary">{product.condition || 'New'}</span>
 </div>

 {/* ✅ Price */}
 <div className="mt-4">
 <span className="text-4xl font-bold gradient-text">${product.price}</span>
 </div>

 <div className="mt-6 space-y-3">
 <h3 className="text-lg font-semibold text-white">Description</h3>
 <p className="text-gray-800 leading-relaxed">{product.description}</p>
 </div>

 <div className="mt-6 space-y-3">
 <h3 className="text-lg font-semibold text-white">Details</h3>
 <div className="space-y-2">
 <div className="flex items-center gap-2 text-gray-600">
 <FaMapMarker className="text-[#14B8A6]" />
 <span>{product.location || 'Location not specified'}</span>
 </div>
 <div className="flex items-center gap-2 text-gray-600">
 <FaTag className="text-[#14B8A6]" />
 <span>Posted {new Date(product.createdAt).toLocaleDateString()}</span>
 </div>
 <div className="flex items-center gap-2 text-gray-600">
 <FaStar className="text-yellow-500" />
 <span>Views: {product.views || 0}</span>
 </div>
 </div>
 </div>

 <div className="mt-6 p-4 glass rounded-xl">
 <h3 className="text-lg font-semibold text-white mb-3">Seller</h3>
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
 {product.user?.fullName?.charAt(0) || 'U'}
 </div>
 <div>
 <p className="text-white font-medium">{product.user?.fullName || 'Unknown Seller'}</p>
 <p className="text-gray-600 text-sm">{product.user?.email}</p>
 </div>
 </div>
 </div>

 {/* ✅ Action Buttons with Message */}
 <div className="mt-6 space-y-3">
 {user?.id !== product.userId && (
 <>
 <Link 
 href={`/messages?userId=${product.user.id}`}
 className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
 >
 <FaEnvelope /> Contact Seller
 </Link>
 </>
 )}
 {user?.id === product.userId && (
 <div className="flex gap-3">
 <Link href={'/products/' + product.id + '/edit'} className="btn-secondary flex-1 text-center py-3">Edit</Link>
 <button className="btn-danger flex-1 py-3">Delete</button>
 </div>
 )}
 </div>
 </div>
 </div>
 </motion.div>
 </div>
 </div>
 )
}