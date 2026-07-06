import { Router } from 'express'
import {
  getMyBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking
} from '../controllers/bookingController'
import { authenticate } from '../middlewares/auth'

const router = Router()

router.use(authenticate)
router.get('/my', getMyBookings)
router.get('/:id', getBookingById)
router.post('/', createBooking)
router.put('/:id/status', updateBookingStatus)
router.put('/:id/cancel', cancelBooking)

export default router
