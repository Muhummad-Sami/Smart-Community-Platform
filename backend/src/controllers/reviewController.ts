import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import prisma from '../config/database'

// Create a review
export const createReview = async (req: Request, res: Response) => {
  try {
    const reviewerId = (req as any).user?.userId
    const { bookingId, rating, comment } = req.body

    if (!bookingId || !rating) {
      return res.status(400).json({
        success: false,
        error: 'Booking ID and rating are required'
      })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      })
    }

    // Check if booking exists and is completed
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        client: true,
        provider: true,
      }
    })

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      })
    }

    // Check if user is the client
    if (booking.clientId !== reviewerId) {
      return res.status(403).json({
        success: false,
        error: 'You can only review your own bookings'
      })
    }

    // Check if booking is completed
    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: 'You can only review completed bookings'
      })
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { bookingId }
    })

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You already reviewed this booking'
      })
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        id: uuidv4(),
        rating,
        comment: comment || '',
        reviewerId,
        revieweeId: booking.providerId,
        bookingId,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
          }
        },
        reviewee: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
          }
        },
        booking: {
          select: {
            id: true,
            service: {
              select: {
                title: true,
              }
            }
          }
        }
      }
    })

    return res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    })
  } catch (error) {
    console.error('Create review error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to create review'
    })
  }
}

// Get reviews for a user
export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
          }
        },
        booking: {
          select: {
            service: {
              select: {
                title: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate average rating
    const ratings = await prisma.review.aggregate({
      where: { revieweeId: userId },
      _avg: { rating: true },
      _count: { rating: true },
    })

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        averageRating: ratings._avg.rating || 0,
        totalReviews: ratings._count.rating || 0,
      }
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews'
    })
  }
}

// Get reviews for current user's bookings (to allow rating)
export const getBookingsToReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId

    const bookings = await prisma.booking.findMany({
      where: {
        clientId: userId,
        status: 'COMPLETED',
        review: null, // Only bookings without reviews
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
          }
        },
        provider: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return res.status(200).json({
      success: true,
      data: bookings
    })
  } catch (error) {
    console.error('Get bookings to review error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    })
  }
}

// Report a review (admin)
export const reportReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const review = await prisma.review.update({
      where: { id },
      data: { isReported: true },
      include: {
        reviewer: {
          select: {
            id: true,
            fullName: true,
          }
        },
        reviewee: {
          select: {
            id: true,
            fullName: true,
          }
        }
      }
    })

    return res.status(200).json({
      success: true,
      message: 'Review reported successfully',
      data: review
    })
  } catch (error) {
    console.error('Report review error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to report review'
    })
  }
}


// ✅ ADD THIS NEW FUNCTION
export const getReviewsWritten = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    const reviews = await prisma.review.findMany({
      where: { reviewerId: userId },
      include: {
        reviewee: {
          select: { id: true, fullName: true, profilePicture: true }
        },
        booking: {
          select: {
            service: { select: { title: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const ratings = await prisma.review.aggregate({
      where: { reviewerId: userId },
      _avg: { rating: true },
      _count: { rating: true },
    })

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        averageRating: ratings._avg.rating || 0,
        totalReviews: ratings._count.rating || 0,
      }
    })
  } catch (error) {
    console.error('Get written reviews error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch written reviews'
    })
  }
}
