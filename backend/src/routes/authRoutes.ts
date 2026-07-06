import { Router } from 'express'
import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile
} from '../controllers/authController'
import { authenticate } from '../middlewares/auth'
import { authLimiter } from '../config/rateLimit'

const router = Router()

// Public routes
router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.get('/verify-email', verifyEmail)
router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/reset-password', authLimiter, resetPassword)

// Protected routes
router.get('/profile', authenticate, getProfile)

export default router
