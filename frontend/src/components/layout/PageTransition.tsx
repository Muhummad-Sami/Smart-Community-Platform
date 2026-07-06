'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true) // Start visible — no blank flash
  const prevPath = useRef(pathname)
  const isFirstMount = useRef(true)

  useEffect(() => {
    // Skip animation on very first mount
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    // Only animate on actual route changes
    if (prevPath.current !== pathname) {
      prevPath.current = pathname
      setIsVisible(false)

      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true)
        })
      })
      return () => cancelAnimationFrame(raf)
    }
  }, [pathname])

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.18s ease, transform 0.18s ease',
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}

