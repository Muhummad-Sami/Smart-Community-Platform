import dotenv from 'dotenv'
import app from './app'
import prisma from './config/database'
import { createServer } from 'http'
import { initializeSocket } from './sockets'

dotenv.config()

const PORT = process.env.PORT || 5000

const server = createServer(app)

// Initialize Socket.io
const io = initializeSocket(server)

export { io }

server.listen(PORT, () => {
  console.log('========================================')
  console.log('🚀 Server running on port:', PORT)
  console.log('📊 Health: /health')
  console.log('🔌 Socket.io ready')
  console.log('🌍 Environment:', process.env.NODE_ENV || 'development')
  console.log('========================================')
})

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n📡 Received ${signal}. Shutting down gracefully...`)

  try {
    await prisma.$disconnect()
    console.log('✅ Database disconnected')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error during shutdown:', error)
    process.exit(1)
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))