'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export function TopLoadingBar() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const prevPath = useRef(pathname)

  useEffect(() => {
    if (prevPath.current !== pathname) {
      // Route changed — show completion
      setProgress(100)
      timerRef.current = setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 300)
      prevPath.current = pathname
    }
  }, [pathname])

  // Listen for link clicks to start the bar
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return
      const href = target.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return

      setLoading(true)
      setProgress(20)

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setProgress(60), 150)
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  if (!loading && progress === 0) return null

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[2px] pointer-events-none"
      style={{
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #14B8A6, #F59E0B)',
        transition: progress === 100
          ? 'width 0.1s ease, opacity 0.3s ease'
          : 'width 0.4s ease',
        opacity: progress === 100 ? 0 : 1,
        boxShadow: '0 0 8px rgba(20,184,166,0.6)',
      }}
    />
  )
}
