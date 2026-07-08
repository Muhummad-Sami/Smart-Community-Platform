'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { serviceService } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { FaArrowLeft, FaImage, FaTimes, FaSpinner, FaSave } from 'react-icons/fa'

const CATEGORIES = ['Web Development', 'Design', 'Photography', 'Tutoring', 'Cleaning', 'Plumbing', 'Electrician', 'Other']

export default function EditServicePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const serviceId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [portfolioImages, setPortfolioImages] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    deliveryTime: '',
    availability: true,
  })

  useEffect(() => {
    if (serviceId) fetchService()
  }, [serviceId])

  const fetchService = async () => {
    try {
      const response = await serviceService.getById(serviceId)
      const service = response.data
      
      // Guard: only owner can edit
      if (user && service.userId !== user.id) {
        toast.error('You are not authorized to edit this service')
        router.push('/services/' + serviceId)
        return
      }

      setFormData({
        title: service.title || '',
        description: service.description || '',
        price: String(service.price || ''),
        category: service.category || '',
        deliveryTime: service.deliveryTime || '',
        availability: service.availability ?? true,
      })

      // Parse portfolio images
      let imgs: string[] = []
      if (service.portfolioImages) {
        if (typeof service.portfolioImages === 'string') {
          try { imgs = JSON.parse(service.portfolioImages) } catch { imgs = [] }
        } else if (Array.isArray(service.portfolioImages)) {
          imgs = service.portfolioImages
        }
      }
      setPortfolioImages(imgs)
    } catch (error) {
      toast.error('Failed to load service')
      router.push('/services')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    if (portfolioImages.length + files.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    setUploadingImage(true)
    const readers = files.map(file => new Promise<string>((resolve, reject) => {
      if (file.size > 2 * 1024 * 1024) { 
        reject(new Error('Image must be under 2MB'))
        return 
      }
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    }))

    Promise.all(readers)
      .then(results => {
        setPortfolioImages(prev => [...prev, ...results])
        toast.success(`${results.length} image(s) added`)
      })
      .catch(err => toast.error(err.message || 'Failed to load image'))
      .finally(() => {
        setUploadingImage(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      })
  }

  const removeImage = (index: number) => {
    setPortfolioImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.price || !formData.category) {
      toast.error('Please fill all required fields')
      return
    }

    setSaving(true)
    try {
      await serviceService.update(serviceId, {
        ...formData,
        price: parseFloat(formData.price),
        portfolioImages: JSON.stringify(portfolioImages),
      })
      
      toast.success('Service updated successfully!')
      router.push('/services/' + serviceId)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update service')
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
        <Link href={'/services/' + serviceId} className="inline-flex items-center gap-2 text-primary-800 hover:text-primary-900 font-medium mb-6 transition-colors">
          <FaArrowLeft /> Back to Service
        </Link>

        <div className="card p-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">Edit Service</h1>
          <p className="text-primary-800 mb-8">Update your service listing details</p>

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
                placeholder="Service title"
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
                placeholder="Describe your service..."
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

            {/* Delivery Time */}
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Delivery Time</label>
              <input
                type="text"
                value={formData.deliveryTime}
                onChange={e => setFormData({ ...formData, deliveryTime: e.target.value })}
                className="input-field"
                placeholder="e.g., 2-3 days"
              />
            </div>

            {/* Availability */}
            <div className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-border">
              <input
                type="checkbox"
                id="availability"
                checked={formData.availability}
                onChange={e => setFormData({ ...formData, availability: e.target.checked })}
                className="w-4 h-4 accent-primary-500"
              />
              <label htmlFor="availability" className="text-sm font-semibold text-primary-900 cursor-pointer">
                Service is available for booking
              </label>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">
                Portfolio Images <span className="text-primary-800 font-normal">(max 5, 2MB each)</span>
              </label>

              {/* Image Previews */}
              {portfolioImages.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {portfolioImages.map((img, i) => (
                    <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-border group">
                      <img src={img} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
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

              {portfolioImages.length < 5 && (
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
              <Link href={'/services/' + serviceId} className="btn-secondary flex-1 py-3 text-center">
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
