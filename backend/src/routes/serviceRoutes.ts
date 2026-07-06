import { Router } from 'express'
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  searchServices,
  getServicesByCategory
} from '../controllers/serviceController'
import { authenticate } from '../middlewares/auth'

const router = Router()

// Public routes
router.get('/', getServices)
router.get('/search', searchServices)
router.get('/category/:category', getServicesByCategory)
router.get('/:id', getServiceById)

// Protected routes
router.post('/', authenticate, createService)
router.put('/:id', authenticate, updateService)
router.delete('/:id', authenticate, deleteService)

export default router
