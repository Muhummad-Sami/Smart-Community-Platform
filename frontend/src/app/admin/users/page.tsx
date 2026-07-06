'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
 FaArrowLeft, FaUser, FaCheck, FaTimes, FaTrash, 
 FaShieldAlt, FaSearch, FaUsers
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import api from '@/services/api/api'
import { AdminRoute } from '@/components/shared/AdminRoute'

export default function AdminUsersPage() {
 const { user } = useAuth()
 const [users, setUsers] = useState<any[]>([])
 const [loading, setLoading] = useState(true)
 const [searchTerm, setSearchTerm] = useState('')

 useEffect(() => {
 if (user && user.role === 'ADMIN') {
 fetchUsers()
 }
 }, [user])

 const fetchUsers = async () => {
 try {
 const response = await api.get('/admin/users')
 setUsers(response.data.data)
 } catch (error) {
 console.error('Error fetching users:', error)
 toast.error('Failed to load users')
 } finally {
 setLoading(false)
 }
 }

 const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
 try {
 await api.put(`/admin/users/${userId}/status`, { isActive: !currentStatus })
 toast.success(`User ${!currentStatus ? 'activated' : 'suspended'} successfully`)
 fetchUsers()
 } catch (error) {
 console.error('Error updating user:', error)
 toast.error('Failed to update user')
 }
 }

 const deleteUser = async (userId: string) => {
 if (!confirm('Are you sure you want to delete this user?')) return
 try {
 await api.delete(`/admin/users/${userId}`)
 toast.success('User deleted successfully')
 fetchUsers()
 } catch (error) {
 console.error('Error deleting user:', error)
 toast.error('Failed to delete user')
 }
 }

 const filteredUsers = users.filter(u => 
 u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
 u.email?.toLowerCase().includes(searchTerm.toLowerCase())
 )

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-background">
 <div className="spinner"></div>
 </div>
 )
 }

 return (
 <AdminRoute>
 <div className="min-h-screen py-24 px-4 bg-background">
 <div className="container-custom max-w-7xl mx-auto">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
 <div>
 <Link href="/admin/dashboard" className="text-primary-800 hover:text-primary-900 transition-colors inline-flex items-center gap-2 mb-4 text-sm font-medium">
 <FaArrowLeft /> Back to Dashboard
 </Link>
 <h1 className="text-3xl md:text-4xl font-bold text-primary-900 mb-2 flex items-center gap-3">
 <FaUsers className="text-primary-500" /> User Management
 </h1>
 <p className="text-primary-800">Manage and oversee all registered accounts</p>
 </div>
 
 <div className="card px-6 py-4 flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center text-cream-100 text-xl shadow-lg">
 <FaUsers />
 </div>
 <div>
 <p className="text-primary-800 text-xs font-bold uppercase tracking-wider">Total Users</p>
 <p className="text-2xl font-bold text-primary-900">{users.length}</p>
 </div>
 </div>
 </div>

 <div className="card p-0 overflow-hidden flex flex-col">
 {/* Toolbar */}
 <div className="p-5 border-b border-border bg-surface flex items-center justify-between">
 <div className="relative w-full max-w-md">
 <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" />
 <input
 type="text"
 placeholder="Search by name or email..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="input-field pl-11 py-2.5 w-full"
 />
 </div>
 </div>

 {/* Table */}
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-surface border-b border-border">
 <th className="py-4 px-6 text-[11px] font-bold text-primary-900 uppercase tracking-wider">User</th>
 <th className="py-4 px-6 text-[11px] font-bold text-primary-900 uppercase tracking-wider">Role</th>
 <th className="py-4 px-6 text-[11px] font-bold text-primary-900 uppercase tracking-wider">Status</th>
 <th className="py-4 px-6 text-[11px] font-bold text-primary-900 uppercase tracking-wider text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {filteredUsers.length === 0 ? (
 <tr>
 <td colSpan={4} className="text-center py-12">
 <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4">
 <FaUsers className="text-2xl text-primary-500" />
 </div>
 <p className="text-primary-800 font-medium">No users found</p>
 </td>
 </tr>
 ) : (
 filteredUsers.map((u) => (
 <motion.tr
 key={u.id}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="hover:bg-surface transition-colors group"
 >
 <td className="py-4 px-6">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-cream-100 font-bold text-sm shadow-md flex-shrink-0">
 {u.fullName?.charAt(0) || 'U'}
 </div>
 <div className="min-w-0">
 <p className="text-sm font-semibold text-primary-900 truncate mb-0.5">{u.fullName}</p>
 <p className="text-[11px] text-primary-800 truncate">{u.email}</p>
 </div>
 </div>
 </td>
 <td className="py-4 px-6">
 <span className={`badge text-[10px] ${u.role === 'ADMIN' ? 'badge-danger' : u.role === 'PROVIDER' ? 'badge-primary' : 'badge-secondary'}`}>
 {u.role}
 </span>
 </td>
 <td className="py-4 px-6">
 <span className={`badge text-[10px] ${u.isActive ? 'badge-success' : 'badge-warning'}`}>
 {u.isActive ? 'Active' : 'Suspended'}
 </span>
 </td>
 <td className="py-4 px-6 text-right">
 <div className="flex items-center justify-end gap-2">
 {u.role !== 'ADMIN' ? (
 <>
 <button
 onClick={() => toggleUserStatus(u.id, u.isActive)}
 className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
 u.isActive 
 ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20' 
 : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20'
 }`}
 >
 {u.isActive ? <FaTimes /> : <FaCheck />}
 {u.isActive ? 'Suspend' : 'Activate'}
 </button>
 <button
 onClick={() => deleteUser(u.id)}
 className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-colors"
 >
 <FaTrash /> Delete
 </button>
 </>
 ) : (
 <span className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-surface text-primary-800 border border-border opacity-50 cursor-not-allowed">
 <FaShieldAlt className="text-primary-500" /> Admin
 </span>
 )}
 </div>
 </td>
 </motion.tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </div>
 </AdminRoute>
 )
}