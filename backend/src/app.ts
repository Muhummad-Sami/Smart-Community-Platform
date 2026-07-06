import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import healthRoutes from './routes/healthRoutes'  // ✅ Add this
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

// CORS
const allowedOrigins = [
  // Local development
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  // Production Vercel domains (exact matches)
  'https://smart-community-platform-six.vercel.app',
  'https://smart-community-platform.vercel.app',
  'https://smart-community.vercel.app',
]

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true)

    // Allow any *.vercel.app subdomain (handles preview deployments)
    if (origin.endsWith('.vercel.app')) return callback(null, true)

    // Allow explicitly listed origins
    if (allowedOrigins.includes(origin)) return callback(null, true)

    // Block everything else in production
    console.warn(`❌ CORS blocked origin: ${origin}`)
    return callback(new Error(`CORS policy: Origin ${origin} not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}

app.use(cors(corsOptions))
// Handle preflight for all routes
app.options('*', cors(corsOptions))

app.use(helmet({
  crossOriginResourcePolicy: false,
}))

app.use(morgan('dev'))

// Raw body for Stripe webhooks must come before json middleware
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ✅ Health check route
app.use('/api', healthRoutes)  // This makes /api/health and /health work

// API Routes
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

// ✅ Additional health check (for root level)
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

app.get('/api/test', (_req, res) => {
  res.json({ success: true, message: 'API is working!' })
})

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' })
})

export default app