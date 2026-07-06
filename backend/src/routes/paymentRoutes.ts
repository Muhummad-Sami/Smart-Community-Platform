import { Router } from 'express'
import { authenticate } from '../middlewares/auth'
import express from 'express'
import {
  createCheckoutSession,
  handleWebhook,
  completePayment,
  getPaymentHistory,
  getPaymentStatus,
} from '../controllers/paymentController'

const router = Router()

// Stripe webhook needs raw body
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook)

router.use(authenticate)
router.post('/create-checkout-session', createCheckoutSession)
router.post('/complete', completePayment)
router.get('/history', getPaymentHistory)
router.get('/booking/:bookingId', getPaymentStatus)

export default router
