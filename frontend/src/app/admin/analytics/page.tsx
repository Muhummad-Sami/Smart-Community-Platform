'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaChartLine, FaArrowLeft, FaSpinner } from 'react-icons/fa'
import Link from 'next/link'
import api from '@/services/api/api'
import { AdminRoute } from '@/components/shared/AdminRoute'
import {
 Chart as ChartJS,
 CategoryScale,
 LinearScale,
 PointElement,
 LineElement,
 BarElement,
 Title,
 Tooltip,
 Legend,
 Filler, // ✅ ADD THIS
 ArcElement
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// ✅ REGISTER Filler plugin
ChartJS.register(
 CategoryScale,
 LinearScale,
 PointElement,
 LineElement,
 BarElement,
 ArcElement,
 Filler, // ✅ ADD THIS
 Title,
 Tooltip,
 Legend
)

export default function AnalyticsPage() {
 const [loading, setLoading] = useState(true)
 const [analyticsData, setAnalyticsData] = useState<any>(null)

 useEffect(() => {
 fetchAnalytics()
 }, [])

 const fetchAnalytics = async () => {
 try {
 const res = await api.get('/analytics')
 setAnalyticsData(res.data.data)
 } catch (err) {
 console.error(err)
 } finally {
 setLoading(false)
 }
 }

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-primary-900">
 <FaSpinner className="text-4xl text-[#14B8A6] animate-spin" />
 </div>
 )
 }

 if (!analyticsData) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-primary-900">
 <p className="text-white">Failed to load analytics</p>
 </div>
 )
 }

 const { usersOverTime, revenueOverTime, servicesByCategory } = analyticsData

 const revenueChartData = {
 labels: revenueOverTime.map((d: any) => d.date),
 datasets: [
 {
 label: 'Revenue ($)',
 data: revenueOverTime.map((d: any) => d.amount),
 borderColor: '#10b981',
 backgroundColor: 'rgba(16, 185, 129, 0.2)',
 tension: 0.4,
 fill: true, // ✅ This requires the Filler plugin
 },
 ],
 }

 const usersChartData = {
 labels: usersOverTime.map((d: any) => d.date),
 datasets: [
 {
 label: 'New Users',
 data: usersOverTime.map((d: any) => d.count),
 backgroundColor: '#14B8A6',
 borderRadius: 4,
 },
 ],
 }

 const categoryChartData = {
 labels: servicesByCategory.map((d: any) => d.category),
 datasets: [
 {
 data: servicesByCategory.map((d: any) => d.count),
 backgroundColor: [
 '#14B8A6', '#0D9488', '#ec4899', '#f59e0b', '#10b981', '#f97316'
 ],
 borderWidth: 0,
 },
 ],
 }

 const chartOptions = {
 responsive: true,
 maintainAspectRatio: false,
 plugins: {
 legend: {
 labels: { color: '#94a3b8' }
 }
 },
 scales: {
 y: {
 grid: { color: 'rgba(255,255,255,0.05)' },
 ticks: { color: '#94a3b8' }
 },
 x: {
 grid: { color: 'rgba(255,255,255,0.05)' },
 ticks: { color: '#94a3b8' }
 }
 }
 }

 return (
 <AdminRoute>
 <div className="min-h-screen py-24 px-4 bg-gradient-to-b from-[#0f1629] to-[#0d1117]">
 <div className="container-custom max-w-7xl">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
 <div>
 <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-white transition-colors mb-4">
 <FaArrowLeft /> Back to Dashboard
 </Link>
 <h1 className="text-3xl md:text-4xl font-bold text-white mb-1 flex items-center gap-3">
 <FaChartLine className="text-[#14B8A6]" /> Analytics Dashboard
 </h1>
 <p className="text-gray-600">Detailed insights and platform metrics</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="card p-6"
 >
 <h3 className="text-xl font-bold text-white mb-6">Revenue Over Time</h3>
 <div className="h-[300px]">
 <Line data={revenueChartData} options={chartOptions} />
 </div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="card p-6"
 >
 <h3 className="text-xl font-bold text-white mb-6">User Growth</h3>
 <div className="h-[300px]">
 <Bar data={usersChartData} options={chartOptions} />
 </div>
 </motion.div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2 }}
 className="card p-6 lg:col-span-1"
 >
 <h3 className="text-xl font-bold text-white mb-6">Services by Category</h3>
 <div className="h-[300px] flex items-center justify-center">
 <Doughnut 
 data={categoryChartData} 
 options={{
 plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } },
 maintainAspectRatio: false
 }} 
 />
 </div>
 </motion.div>
 
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.3 }}
 className="card p-6 lg:col-span-2"
 >
 <h3 className="text-xl font-bold text-white mb-6">Quick Insights</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="p-4 rounded-xl bg-white border border-gray-200">
 <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
 <div className="text-3xl font-bold text-emerald-400">
 ${revenueOverTime.reduce((sum: number, r: any) => sum + r.amount, 0).toFixed(2)}
 </div>
 </div>
 <div className="p-4 rounded-xl bg-white border border-gray-200">
 <div className="text-sm text-gray-600 mb-1">Most Popular Category</div>
 <div className="text-3xl font-bold text-blue-400">
 {servicesByCategory.length > 0 ? servicesByCategory[0].category : 'N/A'}
 </div>
 </div>
 </div>
 </motion.div>
 </div>

 </div>
 </div>
 </AdminRoute>
 )
}