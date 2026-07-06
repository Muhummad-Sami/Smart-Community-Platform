'use client'

import { useState, useRef } from 'react'
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa'
import { toast } from 'react-hot-toast'

interface ImageUploadProps {
 onUpload: (files: File[]) => void
 multiple?: boolean
 maxFiles?: number
 accept?: string
}

export function ImageUpload({ onUpload, multiple = false, maxFiles = 5, accept = 'image/*' }: ImageUploadProps) {
 const [dragActive, setDragActive] = useState(false)
 const [files, setFiles] = useState<File[]>([])
 const inputRef = useRef<HTMLInputElement>(null)

 const handleDrag = (e: React.DragEvent) => {
 e.preventDefault()
 e.stopPropagation()
 if (e.type === 'dragenter' || e.type === 'dragover') {
 setDragActive(true)
 } else if (e.type === 'dragleave') {
 setDragActive(false)
 }
 }

 const handleDrop = (e: React.DragEvent) => {
 e.preventDefault()
 e.stopPropagation()
 setDragActive(false)

 const droppedFiles = Array.from(e.dataTransfer.files)
 handleFiles(droppedFiles)
 }

 const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files) {
 const selectedFiles = Array.from(e.target.files)
 handleFiles(selectedFiles)
 }
 }

 const handleFiles = (newFiles: File[]) => {
 if (!multiple && newFiles.length > 1) {
 toast.error('Only one file is allowed')
 return
 }

 if (files.length + newFiles.length > maxFiles) {
 toast.error(`Maximum ${maxFiles} files allowed`)
 return
 }

 const validFiles = newFiles.filter((file) => {
 if (!file.type.startsWith('image/')) {
 toast.error(`${file.name} is not an image`)
 return false
 }
 if (file.size > 5 * 1024 * 1024) {
 toast.error(`${file.name} exceeds 5MB limit`)
 return false
 }
 return true
 })

 const updatedFiles = [...files, ...validFiles]
 setFiles(updatedFiles)
 onUpload(updatedFiles)
 }

 const removeFile = (index: number) => {
 const updatedFiles = files.filter((_, i) => i !== index)
 setFiles(updatedFiles)
 onUpload(updatedFiles)
 }

 return (
 <div className="space-y-4">
 <div
 className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
 dragActive
 ? 'border-[#14B8A6] bg-[#14B8A6]/5'
 : 'border-gray-200 hover:border-gray-300 bg-white'
 }`}
 onDragEnter={handleDrag}
 onDragLeave={handleDrag}
 onDragOver={handleDrag}
 onDrop={handleDrop}
 onClick={() => inputRef.current?.click()}
 >
 <input
 ref={inputRef}
 type="file"
 multiple={multiple}
 accept={accept}
 onChange={handleFileInput}
 className="hidden"
 />
 <div className="flex flex-col items-center gap-3 cursor-pointer">
 <FaCloudUploadAlt className="text-4xl text-gray-600" />
 <div>
 <p className="text-white font-medium">Drop images here or click to upload</p>
 <p className="text-gray-600 text-sm mt-1">
 {multiple ? `Up to ${maxFiles} images` : 'Single image'} (Max 5MB each)
 </p>
 </div>
 </div>
 </div>

 {files.length > 0 && (
 <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
 {files.map((file, index) => (
 <div key={index} className="relative group">
 <div className="aspect-square rounded-lg overflow-hidden glass">
 <img
 src={URL.createObjectURL(file)}
 alt={file.name}
 className="w-full h-full object-cover"
 />
 </div>
 <button
 onClick={() => removeFile(index)}
 className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
 >
 <FaTimes className="text-white text-xs" />
 </button>
 </div>
 ))}
 </div>
 )}
 </div>
 )
}