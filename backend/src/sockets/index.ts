import { Server, Socket } from 'socket.io'
import { Server as HttpServer } from 'http'
import prisma from '../config/database'
import jwt from 'jsonwebtoken'
import { createMessageNotification, setIo } from '../services/notificationService'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key'

// Store online users globally
const onlineUsers = new Map<string, string>()
;(global as any).onlineUsers = onlineUsers

export const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    // ✅ ADD THIS - Allow both transports
    transports: ['websocket', 'polling'],
    // ✅ ADD THIS - Allow upgrade from polling to websocket
    allowUpgrades: true,
    // ✅ ADD THIS - Ping timeout to keep connection alive
    pingTimeout: 60000,
    pingInterval: 25000,
  })

  // Set io instance for notifications
  setIo(io)

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        console.log('❌ Socket auth: No token provided')
        return next(new Error('Authentication required'))
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any
      socket.data.userId = decoded.userId
      socket.data.userRole = decoded.role
      console.log('✅ Socket authenticated for user:', decoded.userId)
      next()
    } catch (error) {
      console.log('❌ Socket auth error:', error)
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId
    console.log(`🔌 User ${userId} connected, Socket ID: ${socket.id}`)

    // Store user connection
    onlineUsers.set(userId, socket.id)
    ;(global as any).onlineUsers = onlineUsers

    // Join user's personal room
    socket.join(`user-${userId}`)

    // Send online status to all users
    io.emit('user-online', { userId, status: 'online' })

    // Send current online users list to the new user
    const allUsers = Array.from(onlineUsers.keys())
    socket.emit('online-users', allUsers)
    console.log(`👥 Online users:`, allUsers)

    // ✅ Handle sending messages
    socket.on('send-message', async (data) => {
      try {
        const { receiverId, content, attachment } = data

        if (!receiverId || !content) {
          socket.emit('error', { message: 'Missing required fields' })
          return
        }

        // Save message to database
        const message = await prisma.message.create({
          data: {
            content,
            senderId: userId,
            receiverId,
            attachment: attachment || null,
            isRead: false,
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
        })

        // Check if receiver is online
        const receiverSocketId = onlineUsers.get(receiverId)
        const isReceiverOnline = !!receiverSocketId

        // Create notification for receiver
        await createMessageNotification(userId, receiverId, content)

        // If receiver is online, send instantly
        if (isReceiverOnline) {
          io.to(receiverSocketId).emit('new-message', message)
          io.to(receiverSocketId).emit('new-notification', {
            type: 'message',
            title: `New message from ${message.sender.fullName}`,
            content: content.length > 50 ? content.substring(0, 50) + '...' : content,
            link: '/messages',
          })
        }

        // Send to sender with delivery status
        socket.emit('message-sent', {
          ...message,
          delivered: isReceiverOnline,
          read: false,
        })

        // Also add to sender's messages
        socket.emit('new-message', message)

      } catch (error) {
        console.error('Error sending message:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // ✅ Handle typing indicator
    socket.on('typing', ({ receiverId, isTyping }) => {
      const receiverSocketId = onlineUsers.get(receiverId)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user-typing', {
          userId,
          isTyping,
        })
      }
    })

    // ✅ Handle marking messages as read
    socket.on('mark-read', async ({ senderId }) => {
      try {
        await prisma.message.updateMany({
          where: {
            senderId,
            receiverId: userId,
            isRead: false,
          },
          data: { isRead: true, readAt: new Date() },
        })

        // Get updated messages
        const updatedMessages = await prisma.message.findMany({
          where: {
            senderId,
            receiverId: userId,
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
        })

        // Notify sender
        const senderSocketId = onlineUsers.get(senderId)
        if (senderSocketId) {
          io.to(senderSocketId).emit('messages-read', {
            userId,
            senderId,
            messages: updatedMessages,
          })
        }

        // Notify current user
        socket.emit('messages-read-confirmed', {
          senderId,
          messages: updatedMessages,
        })

      } catch (error) {
        console.error('Error marking messages as read:', error)
      }
    })

    // ✅ Handle notification read
    socket.on('notification-read', async ({ notificationId }) => {
      try {
        await prisma.notification.update({
          where: { id: notificationId },
          data: { isRead: true },
        })
        io.to(`user-${userId}`).emit('notification-read', { notificationId })
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    })

    // ✅ Handle all notifications read
    socket.on('all-notifications-read', async () => {
      try {
        await prisma.notification.updateMany({
          where: { userId, isRead: false },
          data: { isRead: true },
        })
        io.to(`user-${userId}`).emit('all-notifications-read')
      } catch (error) {
        console.error('Error marking all notifications as read:', error)
      }
    })

    // ✅ Get conversation history
    socket.on('get-conversation', async ({ userId: otherUserId }) => {
      try {
        const messages = await prisma.message.findMany({
          where: {
            OR: [
              { senderId: userId, receiverId: otherUserId },
              { senderId: otherUserId, receiverId: userId },
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

        socket.emit('conversation-history', messages)

        // Mark unread messages as read
        const unreadMessages = messages.filter(
          (msg) => msg.senderId !== userId && !msg.isRead
        )

        if (unreadMessages.length > 0) {
          await prisma.message.updateMany({
            where: {
              id: { in: unreadMessages.map((msg) => msg.id) },
            },
            data: { isRead: true, readAt: new Date() },
          })

          const senderId = unreadMessages[0]?.senderId
          if (senderId) {
            const senderSocketId = onlineUsers.get(senderId)
            if (senderSocketId) {
              const readMessages = await prisma.message.findMany({
                where: {
                  id: { in: unreadMessages.map((msg) => msg.id) },
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
              })
              io.to(senderSocketId).emit('messages-read', {
                userId,
                senderId,
                messages: readMessages,
              })
            }
          }
        }
      } catch (error) {
        console.error('Error fetching conversation:', error)
        socket.emit('error', { message: 'Failed to fetch conversation' })
      }
    })

    // ✅ Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User ${userId} disconnected`)
      onlineUsers.delete(userId)
      ;(global as any).onlineUsers = onlineUsers
      io.emit('user-online', { userId, status: 'offline' })
    })
  })

  return io
}