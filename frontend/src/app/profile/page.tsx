'use client'

import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaPhone, FaEdit, FaBox, FaTools, FaCalendarCheck, FaStar } from 'react-icons/fa'

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Please Login</h2>
          <p className="text-primary-800 mb-6">You need to be logged in to view your profile</p>
          <Link href="/login" className="btn-primary">Go to Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-background">
      <div className="container-custom max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="card p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full overflow-hidden bg-primary-500 flex items-center justify-center shadow-lg flex-shrink-0">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-cream-100">
                  {user.fullName?.charAt(0) || 'U'}
                </span>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-primary-900">{user.fullName}</h1>
              <p className="text-primary-800 mt-1">@{user.username}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                <span className="badge-primary">{user.role}</span>
                {user.isVerified && <span className="badge-success">✓ Verified</span>}
              </div>
            </div>

            {/* Edit Button */}
            <Link href="/profile/edit" className="btn-primary flex items-center gap-2 px-6 py-3 flex-shrink-0">
              <FaEdit /> Edit Profile
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: <FaBox />, label: 'Products', value: 0 },
            { icon: <FaTools />, label: 'Services', value: 0 },
            { icon: <FaCalendarCheck />, label: 'Bookings', value: 0 },
            { icon: <FaStar />, label: 'Reviews', value: 0 },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="text-3xl mb-2 text-primary-500">{s.icon}</div>
              <div className="stat-number">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Profile Details */}
        <div className="card mt-6 p-8">
          <h2 className="text-xl font-bold text-primary-900 mb-6">Profile Details</h2>
          <div className="space-y-3">
            {[
              { icon: <FaUser className="text-primary-500 text-lg" />, label: 'Full Name', value: user.fullName },
              { icon: <FaEnvelope className="text-primary-500 text-lg" />, label: 'Email', value: user.email },
              { icon: <FaMapMarkerAlt className="text-primary-500 text-lg" />, label: 'Location', value: user.location || 'Not set' },
              { icon: <FaPhone className="text-primary-500 text-lg" />, label: 'Phone', value: (user as any).phone || 'Not set' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border">
                {item.icon}
                <div>
                  <div className="text-xs text-primary-800 font-medium uppercase tracking-wide">{item.label}</div>
                  <div className="text-primary-900 font-medium">{item.value}</div>
                </div>
              </div>
            ))}

            {user.bio && (
              <div className="p-3 bg-surface rounded-xl border border-border">
                <div className="text-xs text-primary-800 font-medium uppercase tracking-wide mb-1">Bio</div>
                <div className="text-primary-900">{user.bio}</div>
              </div>
            )}

            {(user as any).skills && (
              <div className="p-3 bg-surface rounded-xl border border-border">
                <div className="text-xs text-primary-800 font-medium uppercase tracking-wide mb-2">Skills</div>
                <div className="flex flex-wrap gap-2">
                  {((user as any).skills as string).split(',').map((skill: string, i: number) => (
                    <span key={i} className="badge-primary">{skill.trim()}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link href="/dashboard" className="btn-secondary w-full block text-center mt-6">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
