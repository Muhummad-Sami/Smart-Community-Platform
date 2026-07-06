import { Router } from 'express'
import { authenticate } from '../middlewares/auth'
import { 
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllListings,
  approveListing,
  removeListing,
  getAllBookings,
  getReportedReviews,
  resolveReportedReview,
  getAllReviews  
} from '../controllers/adminController'

const router = Router()

// All admin routes require authentication
router.use(authenticate)

// Dashboard
router.get('/stats', getDashboardStats)

// User Management
router.get('/users', getAllUsers)
router.put('/users/:id/status', updateUserStatus)
router.delete('/users/:id', deleteUser)  // ✅ This is correct

// Listing Management
router.get('/listings', getAllListings)
router.put('/listings/:id/approve', approveListing)
router.delete('/listings/:id', removeListing)

// Booking Management
router.get('/bookings', getAllBookings)

// Review Management
router.get('/reviews/all', getAllReviews) 
router.get('/reviews/reported', getReportedReviews)
router.put('/reviews/:id/resolve', resolveReportedReview)

export default router