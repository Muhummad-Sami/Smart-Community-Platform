import { Request, Response } from 'express'
import prisma from '../config/database'

// Check if user is admin
const isAdmin = (req: Request): boolean => {
  return (req as any).user?.role === 'ADMIN'
}

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      })
    }

    const [
      totalUsers,
      totalProducts,
      totalServices,
      totalBookings,
      totalReviews,
      pendingProducts,
      pendingServices,
      reportedReviews
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.service.count(),
      prisma.booking.count(),
      prisma.review.count(),
      prisma.product.count({ where: { isAvailable: false } }),
      prisma.service.count({ where: { availability: false } }),
      prisma.review.count({ where: { isReported: true } })
    ])

    const pendingListings = pendingProducts + pendingServices

    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        service: { select: { title: true } },
        client: { select: { fullName: true, email: true } },
        provider: { select: { fullName: true, email: true } }
      }
    })

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProducts,
          totalServices,
          totalBookings,
          totalReviews,
          pendingListings,
          reportedReviews
        },
        recentActivity: {
          bookings: recentBookings,
          users: recentUsers
        }
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    })
  }
}

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        profilePicture: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
        _count: {
          select: {
            products: true,
            services: true,
            bookingsAsClient: true,
            bookingsAsProvider: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json({
      success: true,
      data: users
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    })
  }
}

// Update user status (suspend/activate)
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      })
    }

    const { id } = req.params
    const { isActive } = req.body

    console.log(`📝 Updating user ${id} status to ${isActive}`)

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true
      }
    })

    return res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'suspended'} successfully`,
      data: user
    })
  } catch (error) {
    console.error('Error updating user status:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update user status'
    })
  }
}

// Delete user
// Delete user - Updated with cascade handling
export const deleteUser = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      })
    }

    const { id } = req.params

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { 
        role: true,
        _count: {
          select: {
            products: true,
            services: true,
            bookingsAsClient: true,
            bookingsAsProvider: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    if (user.role === 'ADMIN') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete admin user'
      })
    }

    // Delete user and all related records
    await prisma.$transaction([
      // Delete favorites
      prisma.favorite.deleteMany({ where: { userId: id } }),
      // Delete notifications
      prisma.notification.deleteMany({ where: { userId: id } }),
      // Delete reviews
      prisma.review.deleteMany({ 
        where: { 
          OR: [
            { reviewerId: id },
            { revieweeId: id }
          ]
        } 
      }),
      // Delete messages
      prisma.message.deleteMany({ 
        where: { 
          OR: [
            { senderId: id },
            { receiverId: id }
          ]
        } 
      }),
      // Delete bookings
      prisma.booking.deleteMany({ 
        where: { 
          OR: [
            { clientId: id },
            { providerId: id }
          ]
        } 
      }),
      // Delete products
      prisma.product.deleteMany({ where: { userId: id } }),
      // Delete services
      prisma.service.deleteMany({ where: { userId: id } }),
      // Finally delete the user
      prisma.user.delete({ where: { id } })
    ])

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    })
  }
}

// Get all listings
export const getAllListings = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      })
    }

    const [products, services] = await Promise.all([
      prisma.product.findMany({
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.service.findMany({
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    return res.status(200).json({
      success: true,
      data: {
        products,
        services
      }
    })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch listings'
    })
  }
}

// Approve listing
// Approve listing - Fixed
export const approveListing = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      })
    }

    const { id } = req.params
    const { type } = req.body

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Type (product or service) is required'
      })
    }

    let listing
    if (type === 'product') {
      listing = await prisma.product.update({
        where: { id },
        data: { isAvailable: true }
      })
    } else if (type === 'service') {
      listing = await prisma.service.update({
        where: { id },
        data: { availability: true }
      })
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be "product" or "service"'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Listing approved successfully',
      data: listing
    })
  } catch (error) {
    console.error('Error approving listing:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to approve listing'
    })
  }
}

// Remove listing - Fixed
export const removeListing = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      })
    }

    const { id } = req.params
    const { type } = req.body

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Type (product or service) is required'
      })
    }

    if (type === 'product') {
      await prisma.product.delete({ where: { id } })
    } else if (type === 'service') {
      await prisma.service.delete({ where: { id } })
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be "product" or "service"'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Listing removed successfully'
    })
  } catch (error) {
    console.error('Error removing listing:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to remove listing'
    })
  }
}

// Get all bookings
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      })
    }

    const bookings = await prisma.booking.findMany({
      include: {
        service: { select: { id: true, title: true, price: true } },
        client: { select: { id: true, fullName: true, email: true } },
        provider: { select: { id: true, fullName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json({
      success: true,
      data: bookings
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    })
  }
}

// Get all reviews (for admin)
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      })
    }

    const reviews = await prisma.review.findMany({
      include: {
        reviewer: { select: { id: true, fullName: true, email: true } },
        reviewee: { select: { id: true, fullName: true, email: true } },
        booking: { select: { service: { select: { title: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json({
      success: true,
      data: reviews
    })
  } catch (error) {
    console.error('Error fetching all reviews:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews'
    })
  }
}

// Get reported reviews
export const getReportedReviews = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      })
    }

    const reviews = await prisma.review.findMany({
      where: { isReported: true },
      include: {
        reviewer: { select: { id: true, fullName: true, email: true } },
        reviewee: { select: { id: true, fullName: true, email: true } },
        booking: { select: { service: { select: { title: true } } } }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return res.status(200).json({
      success: true,
      data: reviews
    })
  } catch (error) {
    console.error('Error fetching reported reviews:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch reported reviews'
    })
  }
}

// Resolve reported review
export const resolveReportedReview = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      })
    }

    const { id } = req.params
    const { action } = req.body

    console.log(`📝 Resolving review ${id} with action: ${action}`)

    if (action === 'remove') {
      await prisma.review.delete({ where: { id } })
      return res.status(200).json({
        success: true,
        message: 'Review removed successfully'
      })
    }

    const review = await prisma.review.update({
      where: { id },
      data: { isReported: false }
    })

    return res.status(200).json({
      success: true,
      message: 'Review kept and un-reported',
      data: review
    })
  } catch (error) {
    console.error('Error resolving reported review:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to resolve reported review'
    })
  }
}