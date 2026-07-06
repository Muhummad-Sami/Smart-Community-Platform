import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import prisma from '../config/database'

// Get all products
export const getProducts = async (_: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return res.status(200).json({
      success: true,
      data: products
    })
  } catch (error) {
    console.error('Get products error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    })
  }
}

// Get single product
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      }
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    return res.status(200).json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Get product error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    })
  }
}

// Create product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId
    const { title, description, price, category, condition, location, images } = req.body

    // Validate
    if (!title || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, price, and category are required'
      })
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        id: uuidv4(),
        title,
        description,
        price: parseFloat(price),
        category,
        condition: condition || 'New',
        location: location || 'Not specified',
        images: images || '[]',  // Store as JSON string
        userId: userId,
        isAvailable: true,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      }
    })

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    })
  } catch (error) {
    console.error('Create product error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to create product'
    })
  }
}

// Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.userId
    const { title, description, price, category, condition, location, isAvailable } = req.body

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Check if user owns the product
    if (existingProduct.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to update this product'
      })
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        title: title || existingProduct.title,
        description: description || existingProduct.description,
        price: price ? parseFloat(price) : existingProduct.price,
        category: category || existingProduct.category,
        condition: condition || existingProduct.condition,
        location: location || existingProduct.location,
        isAvailable: isAvailable !== undefined ? isAvailable : existingProduct.isAvailable,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      }
    })

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    })
  } catch (error) {
    console.error('Update product error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update product'
    })
  }
}

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.userId

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Check if user owns the product
    if (existingProduct.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to delete this product'
      })
    }

    // Delete product
    await prisma.product.delete({
      where: { id }
    })

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Delete product error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    })
  }
}

// Search products
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q, category, minPrice, maxPrice, location } = req.query

    const where: any = {
      isAvailable: true
    }

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

    if (location) {
      where.location = { contains: location as string }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return res.status(200).json({
      success: true,
      data: products
    })
  } catch (error) {
    console.error('Search products error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to search products'
    })
  }
}
