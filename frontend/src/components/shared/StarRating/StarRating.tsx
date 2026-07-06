'use client'

import { useState } from 'react'
import { FaStar } from 'react-icons/fa'

interface StarRatingProps {
 rating: number
 onRatingChange?: (rating: number) => void
 readonly?: boolean
 size?: 'sm' | 'md' | 'lg'
}

export function StarRating({ 
 rating, 
 onRatingChange, 
 readonly = false, 
 size = 'md' 
}: StarRatingProps) {
 const [hoverRating, setHoverRating] = useState(0)

 const sizes = {
 sm: 'text-sm',
 md: 'text-xl',
 lg: 'text-3xl',
 }

 const displayRating = hoverRating || rating

 return (
 <div className="flex gap-1">
 {[1, 2, 3, 4, 5].map((star) => (
 <FaStar
 key={star}
 className={`${sizes[size]} ${
 star <= displayRating 
 ? 'text-yellow-500' 
 : 'text-gray-600'
 } ${!readonly && 'cursor-pointer hover:scale-125 transition-all duration-200'}`}
 onMouseEnter={() => !readonly && setHoverRating(star)}
 onMouseLeave={() => !readonly && setHoverRating(0)}
 onClick={() => !readonly && onRatingChange?.(star)}
 />
 ))}
 </div>
 )
}