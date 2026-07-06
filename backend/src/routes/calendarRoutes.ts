import { Router, Request, Response } from 'express'
import prisma from '../config/database'

const router = Router()

// Get availability for a specific service on a given date
router.get('/:serviceId/availability', async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params
    const { date } = req.query // Format: YYYY-MM-DD

    if (!date || typeof date !== 'string') {
      return res.status(400).json({ success: false, error: 'Date is required' })
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' })
    }

    if (!service.availability) {
      return res.status(200).json({ success: true, data: { availableTimes: [] } })
    }

    // Determine start and end of the day
    const startDate = new Date(`${date}T00:00:00.000Z`)
    const endDate = new Date(`${date}T23:59:59.999Z`)

    // Get all accepted/pending bookings for this service on this date
    const bookings = await prisma.booking.findMany({
      where: {
        serviceId,
        dateTime: {
          gte: startDate,
          lte: endDate
        },
        status: {
          in: ['PENDING', 'ACCEPTED']
        }
      },
      select: { dateTime: true }
    })

    // Create a list of standard available slots (e.g. 9 AM to 5 PM)
    const allSlots = [
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
    ]

    const bookedSlots = bookings.map((b: any) => {
      const d = new Date(b.dateTime)
      return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`
    })

    const availableTimes = allSlots.filter((slot: string) => !bookedSlots.includes(slot))

    return res.status(200).json({
      success: true,
      data: {
        date,
        availableTimes
      }
    })

  } catch (error) {
    console.error('Error fetching availability:', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch availability' })
  }
})

export default router
