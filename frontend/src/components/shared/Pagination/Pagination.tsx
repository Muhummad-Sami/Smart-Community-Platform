'use client'

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

interface PaginationProps {
 currentPage: number
 totalPages: number
 onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
 const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

 const getVisiblePages = () => {
 if (totalPages <= 7) return pages

 if (currentPage <= 4) {
 return [...pages.slice(0, 5), '...', totalPages]
 }

 if (currentPage >= totalPages - 3) {
 return [1, '...', ...pages.slice(totalPages - 5)]
 }

 return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
 }

 const visiblePages = getVisiblePages()

 return (
 <div className="flex items-center justify-center gap-2 mt-6">
 <button
 onClick={() => onPageChange(currentPage - 1)}
 disabled={currentPage === 1}
 className="p-2 rounded-lg glass hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
 >
 <FaChevronLeft className="text-sm" />
 </button>

 {visiblePages.map((page, index) => (
 <button
 key={index}
 onClick={() => typeof page === 'number' && onPageChange(page)}
 className={`px-3 py-1 rounded-lg transition-all ${
 page === currentPage
 ? 'bg-teal-500 text-white'
 : typeof page === 'number'
 ? 'glass hover:bg-gray-100'
 : 'text-gray-600 cursor-default'
 }`}
 disabled={typeof page !== 'number'}
 >
 {page}
 </button>
 ))}

 <button
 onClick={() => onPageChange(currentPage + 1)}
 disabled={currentPage === totalPages}
 className="p-2 rounded-lg glass hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
 >
 <FaChevronRight className="text-sm" />
 </button>
 </div>
 )
}