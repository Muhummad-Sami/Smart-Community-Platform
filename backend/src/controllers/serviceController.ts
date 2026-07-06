import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import prisma from '../config/database'

// Get all services
export const getServices = async (_: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        user: {
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
      data: services
    })
  } catch (error) {
    console.error('Get services error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch services'
    })
  }
}

// Get single service
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePicture: true,
            bio: true,
          }
        },
        bookings: {
          select: {
            id: true,
            status: true,
            dateTime: true,
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

    return res.status(200).json({
      success: true,
      data: service
    })
  } catch (error) {
    console.error('Get service error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch service'
    })
  }
}

// Create service
export const createService = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId
    const { 
      title, 
      description, 
      price, 
      category, 
      deliveryTime, 
      availability,
      portfolioImages 
    } = req.body

    // Validate
    if (!title || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, price, and category are required'
      })
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        id: uuidv4(),
        title,
        description,
        price: parseFloat(price),
        category,
        deliveryTime: deliveryTime || '2-3 days',
        availability: availability !== undefined ? availability : true,
        portfolioImages: portfolioImages || '[]',
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePicture: true,
          }
        }
      }
    })

    return res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    })
  } catch (error) {
    console.error('Create service error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to create service'
    })
  }
}

// Update service
export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.userId
    const { 
      title, 
      description, 
      price, 
      category, 
      deliveryTime, 
      availability,
      portfolioImages 
    } = req.body

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id }
    })

    if (!existingService) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      })
    }

    // Check if user owns the service
    if (existingService.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to update this service'
      })
    }

    // Update service
    const service = await prisma.service.update({
      where: { id },
      data: {
        title: title || existingService.title,
        description: description || existingService.description,
        price: price ? parseFloat(price) : existingService.price,
        category: category || existingService.category,
        deliveryTime: deliveryTime || existingService.deliveryTime,
        availability: availability !== undefined ? availability : existingService.availability,
        portfolioImages: portfolioImages || existingService.portfolioImages,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePicture: true,
          }
        }
      }
    })

    return res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service
    })
  } catch (error) {
    console.error('Update service error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update service'
    })
  }
}

// Delete service
export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.userId

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id }
    })

    if (!existingService) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      })
    }

    // Check if user owns the service
    if (existingService.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to delete this service'
      })
    }

    // Delete service
    await prisma.service.delete({
      where: { id }
    })

    return res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    })
  } catch (error) {
    console.error('Delete service error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to delete service'
    })
  }
}

// Search services
export const searchServices = async (req: Request, res: Response) => {
  try {
    const { q, category, minPrice, maxPrice, availability } = req.query

    const where: any = {}

    if (q) {
      where.OR = [
        { title: { contains: q as string } },
        { description: { contains: q as string } }
      ]
    }

    if (category) {
      where.category = category as string
    }

    if (minPrice) {
      where.price = { ...where.price, gte: parseFloat(minPrice as string) }
    }

    if (maxPrice) {
      where.price = { ...where.price, lte: parseFloat(maxPrice as string) }
    }

    if (availability !== undefined) {
      where.availability = availability === 'true'
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        user: {
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
      data: services
    })
  } catch (error) {
    console.error('Search services error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to search services'
    })
  }
}

// Get services by category
export const getServicesByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params

    const services = await prisma.service.findMany({
      where: {
        category: category,
        availability: true
      },
      include: {
        user: {
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
      data: services
    })
  } catch (error) {
    console.error('Get services by category error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch services'
    })
  }
}
