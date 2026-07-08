'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { productService } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { FaArrowLeft, FaImage, FaTimes, FaSpinner, FaSave } from 'react-icons/fa'

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Web Development', 'Design', 'Photography', 'Tutoring', 'Other']
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair']

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const productId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'New',
    location: '',
    isAvailable: true,
  })

  useEffect(() => {
    if (productId) fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      const response = await productService.getById(productId)
      const product = response.data
      // Guard: only owner can edit
      if (user && product.userId !== user.id) {
        toast.error('You are not authorized to edit this product')
        router.push('/products/' + productId)
        return
      }
      setFormData({
        title: product.title || '',
        description: product.description || '',
        price: String(product.price || ''),
        category: product.category || '',
        condition: product.condition || 'New',
        location: product.location || '',
        isAvailable: product.isAvailable ?? true,
      })
      // Parse images
      let imgs: string[] = []
      if (product.images) {
        if (typeof product.images === 'string') {
          try { imgs = JSON.parse(product.images) } catch { imgs = [] }
        } else if (Array.isArray(product.images)) {
          imgs = product.images
        }
      }
      setImages(imgs)
    } catch (error) {
      toast.error('Failed to load product')
      router.push('/products')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }
    setUploadingImage(true)
    const readers = files.map(file => new Promise<string>((resolve, reject) => {
      if (file.size > 2 * 1024 * 1024) { reject(new Error('Image must be under 2MB')); return }
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    }))
    Promise.all(readers)
      .then(results => {
        setImages(prev => [...prev, ...results])
        toast.success(`${results.length} image(s) added`)
      })
      .catch(err => toast.error(err.message || 'Failed to load image'))
      .finally(() => {
        setUploadingImage(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.description || !formData.price || !formData.category) {
      toast.error('Please fill all required fields')
      return
    }
    setSaving(true)
    try {
      await productService.update(productId, {
        ...formData,
        price: parseFloat(formData.price),
        images: JSON.stringify(images),
      })
      toast.success('Product updated successfully!')
      router.push('/products/' + productId)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-24 px-4 bg-background">
      <div className="container-custom max-w-2xl">
        <Link href={'/products/' + productId} className="inline-flex items-center gap-2 text-primary-800 hover:text-primary-900 font-medium mb-6 transition-colors">
          <FaArrowLeft /> Back to Product
        </Link>

        <div className="card p-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">Edit Product</h1>
          <p className="text-primary-800 mb-8">Update your product listing details</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="Product title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Description *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                placeholder="Describe your product..."
              />
            </div>

            {/* Price & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Price ($) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Condition & Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Condition</label>
                <select
                  value={formData.condition}
                  onChange={e => setFormData({ ...formData, condition: e.target.value })}
                  className="input-field"
                >
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="input-field"
                  placeholder="City, State"
                />
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-border">
              <input
                type="checkbox"
                id="isAvailable"
                checked={formData.isAvailable}
                onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-4 h-4 accent-primary-500"
              />
              <label htmlFor="isAvailable" className="text-sm font-semibold text-primary-900 cursor-pointer">
                Product is available for sale
              </label>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">
                Product Images <span className="text-primary-800 font-normal">(max 5, 2MB each)</span>
              </label>

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-border group">
                      <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute inset-0 bg-primary-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes className="text-cream-100 text-xl" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full border-2 border-dashed border-border hover:border-primary-500 rounded-xl py-8 flex flex-col items-center gap-2 text-primary-800 hover:text-primary-900 transition-colors cursor-pointer bg-surface/50"
                >
                  {uploadingImage
                    ? <FaSpinner className="text-2xl animate-spin" />
                    : <FaImage className="text-2xl" />
                  }
                  <span className="text-sm font-medium">
                    {uploadingImage ? 'Processing...' : 'Click to upload images'}
                  </span>
                  <span className="text-xs text-primary-800">JPG, PNG, WEBP up to 2MB</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-2">
              <Link href={'/products/' + productId} className="btn-secondary flex-1 py-3 text-center">
                Cancel
              </Link>
              <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
