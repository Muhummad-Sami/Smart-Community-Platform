// backend/src/sockets/handlers/messageHandler.ts

import { Server, Socket } from 'socket.io'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const messageCache = new Set<string>()

export const messageHandler = (io: Server, socket: Socket) => {
  
  socket.on('sendMessage', async (data) => {
    try {
      const { tempId, receiverId, content } = data
      const senderId = socket.data.userId

      // Prevent duplicate processing
      const key = `${senderId}_${tempId}`
      if (messageCache.has(key)) {
        console.log('Duplicate message ignored:', key)
        return
      }
      messageCache.add(key)

      // Save message - ONLY ONCE
      const message = await prisma.message.create({
        data: {
          content,
          senderId,
          receiverId,
        },
        include: {
          sender: {
            select: { 
              id: true, 
              fullName: true, 
              profilePicture: true 
            }
          },
          receiver: {
            select: { 
              id: true, 
              fullName: true, 
              profilePicture: true 
            }
          }
        }
      })

      // Emit to receiver - ONLY ONCE
      io.to(receiverId).emit('messageReceived', {
        ...message,
        tempId,
        status: 'delivered'
      })

      // Send back to sender for confirmation
      io.to(senderId).emit('messageDelivered', {
        ...message,
        tempId,
        status: 'delivered'
      })

      // Clean up cache after 5 seconds
      setTimeout(() => {
        messageCache.delete(key)
      }, 5000)

    } catch (error) {
      console.error('Error sending message:', error)
      socket.emit('messageError', { 
        tempId: data.tempId, 
        error: 'Failed to send message' 
      })
    }
  })

  socket.on('typing', (data) => {
    const { receiverId, isTyping } = data
    io.to(receiverId).emit('typing', {
      userId: socket.data.userId,
      isTyping
    })
  })

  socket.on('markRead', async (data) => {
    const { userId } = data
    const readerId = socket.data.userId

    try {
      await prisma.message.updateMany({
        where: {
          senderId: userId,
          receiverId: readerId,
          isRead: false
        },
        data: { 
          isRead: true,
          readAt: new Date()
        }
      })

      io.to(userId).emit('messagesRead', {
        userId: readerId
      })
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.data.userId)
  })
}