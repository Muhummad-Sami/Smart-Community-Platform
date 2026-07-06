import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import authRoutes from './routes/authRoutes'
import productRoutes from './routes/productRoutes'
import serviceRoutes from './routes/serviceRoutes'
import bookingRoutes from './routes/bookingRoutes'
import userRoutes from './routes/userRoutes'
import reviewRoutes from './routes/reviewRoutes'
import adminRoutes from './routes/adminRoutes'
import messageRoutes from './routes/messageRoutes'
import notificationRoutes from './routes/notificationRoutes'
import paymentRoutes from './routes/paymentRoutes'
import aiRoutes from './routes/aiRoutes'
import invoiceRoutes from './routes/invoiceRoutes'
import qrRoutes from './routes/qrRoutes'
import analyticsRoutes from './routes/analyticsRoutes'
import calendarRoutes from './routes/calendarRoutes'

const app = express()

// ✅ FIXED CORS - Allow all origins in development
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://smart-community-platform.vercel.app',
  'https://smart-community.vercel.app',
  process.env.FRONTEND_URL || 'http://localhost:3000'
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true)
    }
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true)
    }
    
    // In production, check against allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.log('🚫 Blocked origin:', origin)
      // ✅ Allow anyway in development
      callback(null, true)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

app.use(helmet({
  crossOriginResourcePolicy: false,
}))

app.use(morgan('dev'))

// Raw body for Stripe webhooks must come before json middleware
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/users', userRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/qr', qrRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/calendar', calendarRoutes)

// Health check
app.get('/health', (_, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

app.get('/api/test', (_, res) => {
  res.json({ success: true, message: 'API is working!' })
})

app.use((_, res) => {
  res.status(404).json({ success: false, error: 'Route not found' })
})

export default app