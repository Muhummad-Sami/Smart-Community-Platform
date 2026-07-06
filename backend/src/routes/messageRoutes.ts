import { Router } from 'express'
import { authenticate } from '../middlewares/auth'
import prisma from '../config/database'

const router = Router()

// Get all users for admin (to start conversations)
router.get('/users', authenticate, async (req, res) => {
  try {
    const currentUserId = (req as any).user?.userId
    const userRole = (req as any).user?.role

    // Only admins can see all users
    if (userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      })
    }

    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId }, // Exclude self
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        profilePicture: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    })

    return res.status(200).json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error('Error fetching users for admin:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
    })
  }
})

// Get conversations with last message
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.userId
    const userRole = (req as any).user?.role

    // Get all unique conversation partners
    const sentMessages = await prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ['receiverId'],
    })

    const receivedMessages = await prisma.message.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
      distinct: ['senderId'],
    })

    let conversationUserIds = [
      ...sentMessages.map((m) => m.receiverId),
      ...receivedMessages.map((m) => m.senderId),
    ]

    // For admin, also add all users who haven't messaged yet
    if (userRole === 'ADMIN') {
      const allUsers = await prisma.user.findMany({
        where: { id: { not: userId } },
        select: { id: true },
      })
      const allUserIds = allUsers.map((u) => u.id)
      // Merge unique IDs
      conversationUserIds = [...new Set([...conversationUserIds, ...allUserIds])]
    }

    const uniqueUserIds = [...new Set(conversationUserIds)]

    // Get user details for each conversation
    const conversations = await Promise.all(
      uniqueUserIds.map(async (otherUserId) => {
        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
            email: true,
            role: true,
            isActive: true,
          },
        })

        if (!otherUser) return null

        // Get last message
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: otherUserId },
              { senderId: otherUserId, receiverId: userId },
            ],
          },
          orderBy: { createdAt: 'desc' },
        })

        // Count unread messages
        const unreadCount = await prisma.message.count({
          where: {
            senderId: otherUserId,
            receiverId: userId,
            isRead: false,
          },
        })

        return {
          user: otherUser,
          lastMessage,
          unreadCount,
        }
      })
    )

    // Filter out null values and sort by last message time
    const validConversations = conversations
      .filter((c) => c !== null)
      .sort((a, b) => {
        if (!a?.lastMessage) return 1
        if (!b?.lastMessage) return -1
        return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
      })

    return res.status(200).json({
      success: true,
      data: validConversations,
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations',
    })
  }
})

// Get conversation with a specific user
router.get('/conversation/:userId', authenticate, async (req, res) => {
  try {
    const currentUserId = (req as any).user?.userId
    const { userId } = req.params
    const userRole = (req as any).user?.role

    // Check if user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }

    // Regular users can only see their own conversations
    // Admins can see everyone's conversations
    if (userRole !== 'ADMIN' && otherUser.id !== currentUserId) {
      // Check if they have messaged before
      const hasMessaged = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: userId },
            { senderId: userId, receiverId: currentUserId },
          ],
        },
      })

      if (!hasMessaged) {
        return res.status(403).json({
          success: false,
          error: 'You are not authorized to view this conversation',
        })
      }
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
          },
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return res.status(200).json({
      success: true,
      data: messages,
    })
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation',
    })
  }
})

// Mark messages as read
router.put('/read/:senderId', authenticate, async (req, res) => {
  try {
    const currentUserId = (req as any).user?.userId
    const { senderId } = req.params

    await prisma.message.updateMany({
      where: {
        senderId,
        receiverId: currentUserId,
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    })

    return res.status(200).json({
      success: true,
      message: 'Messages marked as read',
    })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to mark messages as read',
    })
  }
})

export default router