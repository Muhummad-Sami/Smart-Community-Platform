import { Router } from 'express'
import { authenticate } from '../middlewares/auth'
import prisma from '../config/database'

const router = Router()

// Get all notifications for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.userId

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return res.status(200).json({
      success: true,
      data: notifications,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch notifications' })
  }
})

// Get unread count
router.get('/unread/count', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.userId
    const count = await prisma.notification.count({ where: { userId, isRead: false } })
    return res.status(200).json({ success: true, data: { count } })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch unread count' })
  }
})

// Mark ALL notifications as read — MUST be before /:id routes
router.put('/read-all', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.userId

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    })

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read',
    })
  }
})

// Web-push settings (mock/demo mode since VAPID keys need generation)
let subscriptions: Record<string, any[]> = {}

router.post('/subscribe', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.userId
    const subscription = req.body

    if (!subscriptions[userId]) {
      subscriptions[userId] = []
    }
    subscriptions[userId].push(subscription)

    return res.status(200).json({ success: true, message: 'Subscribed to push notifications' })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to subscribe' })
  }
})

// Support PATCH as well for frontend compatibility
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.userId
    await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } })
    return res.status(200).json({ success: true, message: 'All notifications marked as read' })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to mark all notifications as read' })
  }
})

// Mark single notification as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.userId
    const { id } = req.params
    const notification = await prisma.notification.findFirst({ where: { id, userId } })
    if (!notification) return res.status(404).json({ success: false, error: 'Notification not found' })
    await prisma.notification.update({ where: { id }, data: { isRead: true } })
    return res.status(200).json({ success: true, message: 'Notification marked as read' })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to mark notification as read' })
  }
})

// Support PATCH for single notification as well
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.userId
    const { id } = req.params
    const notification = await prisma.notification.findFirst({ where: { id, userId } })
    if (!notification) return res.status(404).json({ success: false, error: 'Notification not found' })
    await prisma.notification.update({ where: { id }, data: { isRead: true } })
    return res.status(200).json({ success: true, message: 'Notification marked as read' })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to mark notification as read' })
  }
})

// Delete a notification
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.userId
    const { id } = req.params
    await prisma.notification.deleteMany({ where: { id, userId } })
    return res.status(200).json({ success: true, message: 'Notification deleted' })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete notification' })
  }
})

export default router