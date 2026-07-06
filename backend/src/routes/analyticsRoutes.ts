import { Router } from 'express'
import { authenticate } from '../middlewares/auth'
import prisma from '../config/database'

const router = Router()

router.use(authenticate)

// Admin analytics overview
router.get('/overview', async (_req, res) => {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalUsers, newUsers, totalServices, totalBookings,
      recentBookings, completedBookings, totalRevenue,
      categoryStats, dailyBookings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.service.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { totalAmount: true } }),
      prisma.booking.groupBy({
        by: ['serviceId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
      prisma.booking.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: sevenDaysAgo } },
        _count: { id: true },
        orderBy: { createdAt: 'asc' },
      }),
    ])

    // Top services
    const topServiceIds = categoryStats.map(s => s.serviceId)
    const topServicesData = await prisma.service.findMany({
      where: { id: { in: topServiceIds } },
      select: { id: true, title: true, category: true },
    })

    const topServices = categoryStats.map(s => ({
      ...topServicesData.find(ts => ts.id === s.serviceId),
      bookingCount: s._count.id,
    }))

    // Format daily bookings for chart
    const chartData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000)
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const found = dailyBookings.find(b => {
        const bDate = new Date(b.createdAt)
        return bDate.toDateString() === date.toDateString()
      })
      return { date: dateStr, bookings: found?._count?.id || 0 }
    })

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers, newUsers, totalServices, totalBookings,
          recentBookings, completedBookings,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
        },
        topServices,
        chartData,
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch analytics' })
  }
})

// Root analytics route – returns data for frontend charts
router.get('/', async (_req, res) => {
  try {
    const now = new Date()

    // Users over the last 7 days
    const usersOverTime = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const dayStart = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(dayStart)
        dayEnd.setHours(23, 59, 59, 999)
        const count = await prisma.user.count({ where: { createdAt: { gte: dayStart, lte: dayEnd } } })
        return { date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count }
      })
    )

    // Revenue over last 7 days (from paid bookings)
    const revenueOverTime = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const dayStart = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(dayStart)
        dayEnd.setHours(23, 59, 59, 999)
        const agg = await prisma.booking.aggregate({
          where: { paymentStatus: 'PAID', updatedAt: { gte: dayStart, lte: dayEnd } },
          _sum: { totalAmount: true },
        })
        return { date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), amount: agg._sum.totalAmount || 0 }
      })
    )

    // Services grouped by category
    const allServices = await prisma.service.findMany({ select: { category: true } })
    const categoryMap: Record<string, number> = {}
    allServices.forEach(s => { categoryMap[s.category] = (categoryMap[s.category] || 0) + 1 })
    const servicesByCategory = Object.entries(categoryMap).map(([category, count]) => ({ category, count }))

    return res.status(200).json({
      success: true,
      data: { usersOverTime, revenueOverTime, servicesByCategory }
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch analytics' })
  }
})

export default router
