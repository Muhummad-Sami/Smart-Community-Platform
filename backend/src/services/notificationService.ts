import prisma from '../config/database'

// Store the io instance
let io: any = null

export const setIo = (socketIo: any) => {
  io = socketIo
}

interface CreateNotificationParams {
  userId: string
  type: 'message' | 'booking' | 'review' | 'system'
  title: string
  content: string
  link?: string
  image?: string
}

export const createNotification = async (params: CreateNotificationParams) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        content: params.content,
        link: params.link,
        image: params.image,
        isRead: false,
      },
    })

    console.log('🔔 Notification created:', notification.title)

    // Emit real-time notification via Socket.io
    const onlineUsers = (global as any).onlineUsers || new Map()
    const userSocketId = onlineUsers.get(params.userId)

    if (userSocketId && io) {
      io.to(userSocketId).emit('new-notification', notification)
      console.log(`📤 Notification sent to user ${params.userId}`)
    }

    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

export const createMessageNotification = async (senderId: string, receiverId: string, message: string) => {
  try {
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { fullName: true }
    })

    return createNotification({
      userId: receiverId,
      type: 'message',
      title: `New message from ${sender?.fullName || 'Someone'}`,
      content: message.length > 50 ? message.substring(0, 50) + '...' : message,
      link: '/messages',
    })
  } catch (error) {
    console.error('Error creating message notification:', error)
    return null
  }
}

export const createBookingNotification = async (userId: string, bookingId: string, status: string) => {
  const statusMessages: Record<string, { title: string; content: string }> = {
    PENDING: {
      title: 'New Booking Request',
      content: 'You have a new booking request waiting for your response.',
    },
    ACCEPTED: {
      title: 'Booking Accepted',
      content: 'Your booking has been accepted! The provider will contact you soon.',
    },
    REJECTED: {
      title: 'Booking Rejected',
      content: 'Your booking request was rejected. You can try booking another service.',
    },
    COMPLETED: {
      title: 'Booking Completed',
      content: 'Your booking has been marked as completed. Please leave a review!',
    },
    CANCELLED: {
      title: 'Booking Cancelled',
      content: 'Your booking has been cancelled.',
    },
  }

  const message = statusMessages[status] || statusMessages.PENDING

  return createNotification({
    userId,
    type: 'booking',
    title: message.title,
    content: message.content,
    link: `/bookings/${bookingId}`,
  })
}

export const createReviewNotification = async (reviewerId: string, revieweeId: string, rating: number) => {
  try {
    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId },
      select: { fullName: true }
    })

    return createNotification({
      userId: revieweeId,
      type: 'review',
      title: `New ${rating}⭐ Review`,
      content: `${reviewer?.fullName || 'Someone'} left you a ${rating} star review!`,
      link: '/reviews',
    })
  } catch (error) {
    console.error('Error creating review notification:', error)
    return null
  }
}