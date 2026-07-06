import { Router } from 'express'
import {
  createReview,
  getUserReviews,
  getReviewsWritten,  // ✅ ADD THIS IMPORT
  getBookingsToReview,
  reportReview,
} from '../controllers/reviewController'
import { authenticate } from '../middlewares/auth'

const router = Router()

// Protected routes
router.post('/', authenticate, createReview)
router.get('/my-bookings', authenticate, getBookingsToReview)
router.get('/user/:userId', getUserReviews)
router.get('/written/:userId', authenticate, getReviewsWritten)  // ✅ ADD THIS ROUTE
router.put('/:id/report', authenticate, reportReview)

export default router