'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useNotifications } from '@/context/NotificationContext'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaUser, FaSignOutAlt, FaBars, FaTimes, FaStar,
  FaShieldAlt, FaComments, FaBell, FaBox, FaTools,
  FaCalendarCheck, FaHome, FaChevronDown, FaStore
} from 'react-icons/fa'
import { useRouter, usePathname } from 'next/navigation'

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const { unreadCount, notifications, markAllAsRead, markAsRead } = useNotifications()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  const isAdmin = user?.role === 'ADMIN'
  const isProvider = user?.role === 'PROVIDER'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {
    logout()
    setIsProfileOpen(false)
  }

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard'
    if (isProvider) return '/provider/dashboard'
    return '/dashboard'
  }

  const navLinks = [
    { href: '/products', label: 'Products', icon: <FaBox className="text-[10px]" /> },
    { href: '/services', label: 'Services', icon: <FaTools className="text-[10px]" /> },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-primary-900 shadow-lg border-b border-primary-800`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <FaStore className="text-[#FBF5DD] text-xs" />
            </div>
            <span className="text-xl font-bold text-[#FBF5DD] hidden sm:block">SmartCommunity</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'text-[#FBF5DD] bg-primary-800'
                    : 'text-[#E7E1B1] hover:text-[#FBF5DD] hover:bg-primary-800/50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && user && (
              <>
                <Link
                  href="/messages"
                  className={`nav-link flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === '/messages'
                      ? 'text-[#FBF5DD] bg-primary-800'
                      : 'text-[#E7E1B1] hover:text-[#FBF5DD] hover:bg-primary-800/50'
                  }`}
                >
                  <FaComments className={pathname === '/messages' ? 'text-[#FBF5DD]' : 'text-[#E7E1B1]'} />
                  Messages
                </Link>

                <Link
                  href={user.role === 'ADMIN' ? '/admin/bookings' : user.role === 'PROVIDER' ? '/provider/dashboard' : '/bookings'}
                  className={`nav-link flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname.includes('/bookings') || pathname === '/provider/dashboard'
                      ? 'text-[#FBF5DD] bg-primary-800'
                      : 'text-[#E7E1B1] hover:text-[#FBF5DD] hover:bg-primary-800/50'
                  }`}
                >
                  <FaCalendarCheck className={pathname.includes('/bookings') || pathname === '/provider/dashboard' ? 'text-[#FBF5DD]' : 'text-[#E7E1B1]'} />
                  Bookings
                </Link>
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                {/* Notification Bell */}
                <div ref={notifRef} className="relative">
                  <button
                    onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false) }}
                    className="relative w-10 h-10 flex items-center justify-center rounded-xl text-[#E7E1B1] hover:text-[#FBF5DD] hover:bg-primary-800/50 transition-all duration-200"
                    aria-label="Notifications"
                  >
                    <FaBell className={`text-lg ${unreadCount > 0 ? 'animate-ring text-accent-500' : ''}`} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-500 text-[#FBF5DD] text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-80 bg-bg-elevated border border-border rounded-2xl shadow-dropdown overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                          <h3 className="text-sm font-semibold text-primary-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs text-primary-800 hover:text-primary-900 transition-colors">
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center">
                              <FaBell className="text-3xl text-primary-800/30 mx-auto mb-2" />
                              <p className="text-text-muted text-sm">No notifications yet</p>
                            </div>
                          ) : (
                            notifications.slice(0, 8).map((n) => (
                              <div
                                key={n.id}
                                onClick={() => {
                                  if (!n.isRead) markAsRead(n.id)
                                  setIsNotifOpen(false)
                                  if (n.link) router.push(n.link)
                                }}
                                className={`px-4 py-3 border-b border-border/50 hover:bg-bg-surface transition-colors cursor-pointer ${!n.isRead ? 'bg-primary-800/5' : ''}`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.isRead ? 'bg-primary-500' : 'bg-border'}`} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-primary truncate">{n.title}</p>
                                    <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.content}</p>
                                    <p className="text-xs text-text-muted mt-1">
                                      {new Date(n.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="px-4 py-3 border-t border-border bg-bg-surface/30">
                          <Link
                            href="/notifications"
                            onClick={() => setIsNotifOpen(false)}
                            className="text-xs font-medium text-primary-800 hover:text-primary-900 transition-colors block text-center"
                          >
                            View all notifications →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Dropdown */}
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false) }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-primary-800/50 transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center text-[#FBF5DD] font-bold text-sm shadow-md transition-all duration-300">
                      {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-[#FBF5DD] leading-none">{user.fullName?.split(' ')[0]}</p>
                      <p className="text-[10px] text-[#E7E1B1] mt-0.5 capitalize">{user.role?.toLowerCase()}</p>
                    </div>
                    <FaChevronDown className={`text-[#E7E1B1] text-xs transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-52 bg-bg-elevated border border-border rounded-2xl shadow-dropdown overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-border bg-bg-surface/30">
                          <p className="text-sm font-semibold text-primary-900 truncate">{user.fullName}</p>
                          <p className="text-xs text-text-muted truncate mt-0.5">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link href={getDashboardLink()} onClick={() => setIsProfileOpen(false)} className="dropdown-item">
                            <FaHome className="text-primary-500" /> Dashboard
                          </Link>
                          <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="dropdown-item">
                            <FaUser className="text-primary-500" /> My Profile
                          </Link>
                          {isProvider && (
                            <Link href="/reviews" onClick={() => setIsProfileOpen(false)} className="dropdown-item">
                              <FaStar className="text-accent-500" /> My Reviews
                            </Link>
                          )}
                          {isAdmin && (
                            <Link href="/admin/dashboard" onClick={() => setIsProfileOpen(false)} className="dropdown-item">
                              <FaShieldAlt className="text-primary-600" /> Admin Panel
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-border py-1">
                          <button onClick={handleLogout} className="dropdown-item w-full text-left text-red-500 hover:bg-red-500/10 hover:text-red-600">
                            <FaSignOutAlt /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm text-[#E7E1B1] hover:text-[#FBF5DD] transition-colors font-medium">
                  Login
                </Link>
                <Link href="/register" className="btn-primary">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-[#E7E1B1] hover:text-[#FBF5DD] hover:bg-primary-800/50 transition-all duration-200"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-primary-800 bg-primary-900 shadow-xl"
            >
              <div className="py-4 flex flex-col gap-1 px-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      pathname === link.href ? 'text-[#FBF5DD] bg-primary-800' : 'text-[#E7E1B1] hover:text-[#FBF5DD] hover:bg-primary-800/50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {isAuthenticated && user ? (
                  <>
                    <Link href="/messages" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-[#E7E1B1] hover:text-[#FBF5DD] hover:bg-primary-800/50 transition-all duration-200">
                      <FaComments className="text-primary-500" /> Messages
                    </Link>
                    <Link href="/bookings" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-[#E7E1B1] hover:text-[#FBF5DD] hover:bg-primary-800/50 transition-all duration-200">
                      <FaCalendarCheck className="text-primary-500" /> Bookings
                    </Link>
                    <Link href={getDashboardLink()} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-[#E7E1B1] hover:text-[#FBF5DD] hover:bg-primary-800/50 transition-all duration-200">
                      <FaHome className="text-primary-500" /> Dashboard
                    </Link>
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-[#E7E1B1] hover:text-[#FBF5DD] hover:bg-primary-800/50 transition-all duration-200">
                      <FaUser className="text-primary-500" /> My Profile
                    </Link>
                    <Link href="/notifications" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-[#E7E1B1] hover:text-[#FBF5DD] hover:bg-primary-800/50 transition-all duration-200">
                      <FaBell className="text-primary-500" /> Notifications {unreadCount > 0 && <span className="badge badge-primary bg-accent-500 border-none ml-2">{unreadCount}</span>}
                    </Link>
                    {isAdmin && (
                      <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-[#E7E1B1] hover:text-[#FBF5DD] hover:bg-primary-800/50 transition-all duration-200">
                        <FaShieldAlt className="text-primary-500" /> Admin Panel
                      </Link>
                    )}
                    <div className="pt-2 mt-2 border-t border-primary-800">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 w-full text-left"
                      >
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-2 border-t border-primary-800 mt-2">
                    <Link href="/login" className="btn-secondary w-full text-center bg-transparent text-[#FBF5DD] hover:bg-primary-800 border-primary-800">Login</Link>
                    <Link href="/register" className="btn-primary w-full text-center">Get Started</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
