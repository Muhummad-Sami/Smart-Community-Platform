import { Router } from 'express'
import {
  getUserProfile,
  updateProfile,
  getUserStats,
  getUserListings,
} from '../controllers/userController'
import { authenticate } from '../middlewares/auth'

const router = Router()

// Public routes
router.get('/:id', getUserProfile)

// Protected routes
router.put('/profile', authenticate, updateProfile)
router.get('/profile/stats', authenticate, getUserStats)
router.get('/profile/listings', authenticate, getUserListings)

export default router
