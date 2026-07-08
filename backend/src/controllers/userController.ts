import { Request, Response } from 'express'
import prisma from '../config/database'
import { successResponse, errorResponse } from '../utils/response'

// Get user profile by ID
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        profilePicture: true,
        bio: true,
        location: true,
        phone: true,
        skills: true,
        role: true,
        isVerified: true,
        createdAt: true,
        products: {
          where: { isAvailable: true },
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            category: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        services: {
          where: { availability: true },
          select: {
            id: true,
            title: true,
            price: true,
            category: true,
            portfolioImages: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        reviewsReceived: {
          select: {
            rating: true,
            comment: true,
            reviewer: {
              select: {
                id: true,
                fullName: true,
                profilePicture: true,
              },
            },
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!user) {
      return errorResponse(res, 'User not found', 404)
    }

    // Calculate average rating
    const reviews = await prisma.review.aggregate({
      where: { revieweeId: id },
      _avg: { rating: true },
      _count: { rating: true },
    })

    const profile = {
      ...user,
      averageRating: reviews._avg.rating || 0,
      totalReviews: reviews._count.rating || 0,
    }

    return successResponse(res, profile, 'Profile fetched successfully')
  } catch (error) {
    console.error('Get profile error:', error)
    return errorResponse(res, 'Failed to fetch profile', 500)
  }
}

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId
    const { fullName, username, bio, location, phone, skills } = req.body

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: fullName || undefined,
        username: username || undefined,
        bio: bio || undefined,
        location: location || undefined,
        phone: phone || undefined,
        skills: skills || undefined,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        profilePicture: true,
        bio: true,
        location: true,
        phone: true,
        skills: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    })

    return successResponse(res, user, 'Profile updated successfully')
  } catch (error) {
    console.error('Update profile error:', error)
    return errorResponse(res, 'Failed to update profile', 500)
  }
}

// Get user statistics
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId

    const [products, services, bookings, reviews] = await Promise.all([
      prisma.product.count({
        where: { userId, isAvailable: true },
      }),
      prisma.service.count({
        where: { userId, availability: true },
      }),
      prisma.booking.count({
        where: {
          OR: [
            { clientId: userId },
            { providerId: userId },
          ],
        },
      }),
      prisma.review.count({
        where: { revieweeId: userId },
      }),
    ])

    const stats = {
      products,
      services,
      bookings,
      reviews,
    }

    return successResponse(res, stats, 'Stats fetched successfully')
  } catch (error) {
    console.error('Get stats error:', error)
    return errorResponse(res, 'Failed to fetch stats', 500)
  }
}

// Get user's active listings
export const getUserListings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId

    const [products, services] = await Promise.all([
      prisma.product.findMany({
        where: { userId },  // All products, including unavailable ones
        select: {
          id: true,
          title: true,
          price: true,
          images: true,
          category: true,
          isAvailable: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.service.findMany({
        where: { userId },  // All services, including unavailable ones
        select: {
          id: true,
          title: true,
          price: true,
          category: true,
          availability: true,
          portfolioImages: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const listings = {
      products,
      services,
    }

    return successResponse(res, listings, 'Listings fetched successfully')
  } catch (error) {
    console.error('Get listings error:', error)
    return errorResponse(res, 'Failed to fetch listings', 500)
  }
}
