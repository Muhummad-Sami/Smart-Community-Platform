import { Request, Response } from 'express'
import prisma from '../config/database'
import { v4 as uuidv4 } from 'uuid'

// Helper to get Stripe instance safely
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || key.includes('placeholder')) return null
  const Stripe = require('stripe')
  return new Stripe(key, { apiVersion: '2023-10-16' })
}

// Create Stripe Checkout Session for a booking
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId
    const { bookingId } = req.body

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, clientId: userId },
      include: {
        service: { select: { title: true, description: true } },
        client: { select: { email: true, fullName: true } },
      },
    })

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' })
    }

    if (booking.paymentStatus === 'PAID') {
      return res.status(400).json({ success: false, error: 'Booking already paid' })
    }

    const stripe = getStripe()

    // If Stripe keys are not configured, return mock session
    if (!stripe) {
      const mockSessionId = `mock_session_${uuidv4()}`
      await prisma.payment.upsert({
        where: { bookingId },
        create: {
          id: uuidv4(),
          bookingId,
          stripeSessionId: mockSessionId,
          amount: booking.totalAmount,
          currency: 'usd',
          status: 'PENDING',
        },
        update: { stripeSessionId: mockSessionId, status: 'PENDING' },
      })
      return res.status(200).json({
        success: true,
        data: {
          sessionId: mockSessionId,
          url: `${process.env.FRONTEND_URL}/payment/success?session_id=${mockSessionId}&booking_id=${bookingId}&mock=true`,
          isMock: true,
          message: 'Running in demo mode - Stripe keys not configured',
        },
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: booking.client.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: booking.service.title,
              description: booking.service.description?.substring(0, 200) || '',
            },
            unit_amount: Math.round(booking.totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { bookingId, userId },
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?booking_id=${bookingId}`,
    })

    await prisma.payment.upsert({
      where: { bookingId },
      create: {
        id: uuidv4(),
        bookingId,
        stripeSessionId: session.id,
        amount: booking.totalAmount,
        currency: 'usd',
        status: 'PENDING',
      },
      update: { stripeSessionId: session.id, status: 'PENDING' },
    })

    return res.status(200).json({
      success: true,
      data: { sessionId: session.id, url: session.url },
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return res.status(500).json({ success: false, error: 'Failed to create checkout session' })
  }
}

// Handle Stripe Webhook
export const handleWebhook = async (req: Request, res: Response) => {
  const stripe = getStripe()
  if (!stripe) return res.status(200).json({ received: true })

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event: any

  try {
    const sig = req.headers['stripe-signature'] as string
    if (webhookSecret && !webhookSecret.includes('placeholder')) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
    } else {
      event = req.body
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const bookingId = session.metadata?.bookingId

      if (bookingId) {
        await prisma.payment.update({
          where: { bookingId },
          data: { status: 'COMPLETED', stripePaymentIntentId: session.payment_intent },
        })
        await prisma.booking.update({
          where: { id: bookingId },
          data: { paymentStatus: 'PAID' },
        })
      }
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return res.status(400).json({ error: 'Webhook processing failed' })
  }
}

// Mark payment as completed (for mock/demo mode)
export const completePayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId
    const { bookingId, sessionId } = req.body

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, clientId: userId },
    })

    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' })

    await prisma.payment.upsert({
      where: { bookingId },
      create: {
        id: uuidv4(),
        bookingId,
        stripeSessionId: sessionId,
        amount: booking.totalAmount,
        currency: 'usd',
        status: 'COMPLETED',
      },
      update: { status: 'COMPLETED', stripeSessionId: sessionId },
    })

    await prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: 'PAID' },
    })

    // Create notification for provider
    await prisma.notification.create({
      data: {
        id: uuidv4(),
        userId: booking.providerId,
        type: 'booking',
        title: 'Payment Received',
        content: `Payment of $${booking.totalAmount} received for booking #${booking.id.slice(0, 8)}`,
        link: `/bookings/${booking.id}`,
      },
    })

    return res.status(200).json({ success: true, message: 'Payment completed successfully' })
  } catch (error) {
    console.error('Complete payment error:', error)
    return res.status(500).json({ success: false, error: 'Failed to complete payment' })
  }
}

// Get payment history for user
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId

    const payments = await prisma.payment.findMany({
      where: { booking: { clientId: userId } },
      include: {
        booking: {
          include: {
            service: { select: { title: true } },
            provider: { select: { fullName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json({ success: true, data: payments })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch payment history' })
  }
}

// Get payment status for a booking
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId
    const { bookingId } = req.params

    const payment = await prisma.payment.findFirst({
      where: { bookingId, booking: { clientId: userId } },
    })

    return res.status(200).json({ success: true, data: payment })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch payment status' })
  }
}
