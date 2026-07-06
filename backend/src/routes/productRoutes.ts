import { Router } from 'express'
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts
} from '../controllers/productController'
import { authenticate } from '../middlewares/auth'

const router = Router()

// Public routes
router.get('/', getProducts)
router.get('/search', searchProducts)
router.get('/:id', getProductById)

// Protected routes
router.post('/', authenticate, createProduct)
router.put('/:id', authenticate, updateProduct)
router.delete('/:id', authenticate, deleteProduct)

export default router
