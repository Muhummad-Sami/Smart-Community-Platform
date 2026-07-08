'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { productService } from '@/services/api'
import { serviceService } from '@/services/api'
import { FaMagic, FaSpinner, FaImage, FaTimes } from 'react-icons/fa'
import api from '@/services/api/api'

export default function CreateListingPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [generatingDesc, setGeneratingDesc] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [listingType, setListingType] = useState('product')
  const [images, setImages] = useState<string[]>([])
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
    setLoading(true)

    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        images: JSON.stringify(images),
      }

      if (listingType === 'product') {
        await productService.create(data)
        toast.success('Product created successfully!')
        router.push('/products')
      } else {
        await serviceService.create(data)
        toast.success('Service created successfully!')
        router.push('/services')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-24 px-4 bg-background">
      <div className="container-custom max-w-2xl mx-auto">
        <div className="card p-8">
          <h1 className="text-3xl font-bold text-primary-900 text-center mb-2">
            Create New Listing
          </h1>
          <p className="text-primary-800 text-center mb-6">Add a product or service to the marketplace</p>

          {/* Type Toggle */}
          <div className="flex gap-3 mb-8 p-1 bg-surface rounded-xl border border-border">
            <button
              onClick={() => setListingType('product')}
              className={listingType === 'product' ? 'btn-primary flex-1 py-2 px-4 rounded-lg' : 'flex-1 py-2 px-4 rounded-lg text-primary-800 hover:text-primary-900 font-semibold transition-colors'}
            >
              📦 Product
            </button>
            <button
              onClick={() => setListingType('service')}
              className={listingType === 'service' ? 'btn-primary flex-1 py-2 px-4 rounded-lg' : 'flex-1 py-2 px-4 rounded-lg text-primary-800 hover:text-primary-900 font-semibold transition-colors'}
            >
              🛠️ Service
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Title *</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" placeholder="Enter title" />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-primary-900">Description *</label>
                <button
                  type="button"
                  onClick={generateDescription}
                  disabled={generatingDesc}
                  className="flex items-center gap-1.5 text-xs bg-primary-500 text-cream-100 px-3 py-1.5 rounded-full hover:bg-primary-900 transition-colors disabled:opacity-50 font-medium"
                >
                  {generatingDesc ? <FaSpinner className="animate-spin" /> : <FaMagic />}
                  {generatingDesc ? 'Generating...' : 'AI Generate'}
                </button>
              </div>
              <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" placeholder="Describe your listing..." />
            </div>

            {/* Price & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Price ($) *</label>
                <input type="number" required step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="input-field" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Category *</label>
                <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field">
                  <option value="">Select category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Books">Books</option>
                  <option value="Home">Home</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Design">Design</option>
                  <option value="Photography">Photography</option>
                  <option value="Tutoring">Tutoring</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {listingType === 'product' && (
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Condition</label>
                <select value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })} className="input-field">
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
            )}

            {listingType === 'service' && (
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Delivery Time</label>
                <input type="text" value={formData.deliveryTime} onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })} className="input-field" placeholder="e.g., 2-3 days" />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Location</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="input-field" placeholder="City, State" />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">
                Images <span className="font-normal text-primary-800">(optional, max 5, 2MB each)</span>
              </label>

              {images.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-border group flex-shrink-0">
                      <img src={img} alt={`img ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute inset-0 bg-primary-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes className="text-cream-100 text-lg" />
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
                  className="w-full border-2 border-dashed border-border hover:border-primary-500 rounded-xl py-6 flex flex-col items-center gap-2 text-primary-800 hover:text-primary-900 transition-colors bg-surface/40"
                >
                  {uploadingImage ? <FaSpinner className="text-xl animate-spin" /> : <FaImage className="text-xl" />}
                  <span className="text-sm font-medium">{uploadingImage ? 'Processing...' : 'Click to upload images'}</span>
                  <span className="text-xs">JPG, PNG, WEBP up to 2MB</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={handleImageUpload} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base font-semibold">
              {loading ? <><FaSpinner className="animate-spin inline mr-2" />Creating...</> : `Create ${listingType === 'product' ? 'Product' : 'Service'}`}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link href="/provider/dashboard" className="text-primary-800 hover:text-primary-900 font-medium transition-colors text-sm">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}