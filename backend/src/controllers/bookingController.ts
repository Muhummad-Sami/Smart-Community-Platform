import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import prisma from '../config/database'
import { createNotification } from '../services/notificationService'

// Get all bookings for the current user
export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { clientId: userId },
          { providerId: userId }
        ]
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            price: true,
            category: true,
          }
        },
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePicture: true,
          }
        },
        provider: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePicture: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return res.status(200).json({
      success: true,
      data: bookings
    })
  } catch (error) {
    console.error('Get bookings error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    })
  }
}

// Get single booking by ID
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.userId

    console.log('?? Fetching booking:', id)

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            category: true,
          }
        },
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePicture: true,
          }
        },
        provider: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePicture: true,
          }
        }
      }
    })

    if (!booking) {
      console.log('? Booking not found:', id)
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      })
    }

    if (booking.clientId !== userId && booking.providerId !== userId) {
      console.log('? User not authorized:', userId)
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to view this booking'
      })
    }

    console.log('? Booking found:', booking.id)
    return res.status(200).json({
      success: true,
      data: booking
    })
  } catch (error) {
    console.error('Get booking error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch booking'
    })
  }
}

// Create booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user?.userId
    const { serviceId, dateTime, notes } = req.body

    if (!serviceId || !dateTime) {
      return res.status(400).json({
        success: false,
        error: 'Service ID and date/time are required'
      })
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          }
        }
      }
    })

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      })
    }

    if (!service.availability) {
      return res.status(400).json({
        success: false,
        error: 'Service is not available'
      })
    }

    if (service.userId === clientId) {
      return res.status(400).json({
        success: false,
        error: 'You cannot book your own service'
      })
    }

    const booking = await prisma.booking.create({
      data: {
        id: uuidv4(),
        serviceId,
        clientId,
        providerId: service.userId,
        dateTime: new Date(dateTime),
        notes: notes || '',
        status: 'PENDING',
        totalAmount: service.price,
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            price: true,
          }
        },
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        },
        provider: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      }
    })

    // Create Notification for the Provider
    await createNotification({
      userId: service.userId,
      type: 'booking',
      title: 'New Booking Request',
      content: `You have a new booking request for ${service.title}`,
      link: `/bookings/${booking.id}`
    })

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    })
  } catch (error) {
    console.error('Create booking error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to create booking'
    })
  }
}

// Update booking status
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.userId
    const { status } = req.body

    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED']
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      })
    }

    const booking = await prisma.booking.findUnique({
      where: { id }
    })

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      })
    }

    const isProvider = booking.providerId === userId
    const isClient = booking.clientId === userId

    if (!isProvider && !isClient) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      })
    }

    if (isClient && status !== 'CANCELLED') {
      return res.status(403).json({
        success: false,
        error: 'You can only cancel your booking'
      })
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            price: true,
          }
        },
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        },
        provider: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      }
    })

    // Create Notification for the Client
    await createNotification({
      userId: updatedBooking.clientId,
      type: 'booking',
      title: `Booking ${status}`,
      content: `Your booking for ${updatedBooking.service?.title} was ${status.toLowerCase()}`,
      link: `/bookings/${updatedBooking.id}`
    })

    return res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: updatedBooking
    })
  } catch (error) {
    console.error('Update booking error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update booking'
    })
  }
}

// Cancel booking
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.userId

    console.log('?? Cancel booking request:', { id, userId })

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            title: true,
          }
        }
      }
    })

    if (!booking) {
      console.log('? Booking not found:', id)
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      })
    }

    console.log('?? Booking found:', booking)

    if (booking.clientId !== userId) {
      console.log('? User not authorized:', { userId, clientId: booking.clientId })
      return res.status(403).json({
        success: false,
        error: 'You can only cancel your own bookings'
      })
    }

    if (booking.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel a completed booking'
      })
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        error: 'Booking is already cancelled'
      })
    }

    if (booking.status === 'REJECTED') {
      return res.status(400).json({
        success: false,
        error: 'Booking was already rejected by the provider'
      })
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    })

    console.log('? Booking cancelled:', updatedBooking.id)

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: updatedBooking
    })
  } catch (error) {
    console.error('? Cancel booking error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to cancel booking'
    })
  }
}
