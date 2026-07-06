import { Router } from 'express'
import { authenticate } from '../middlewares/auth'
import { generateDescription, getRecommendations } from '../controllers/aiController'

const router = Router()

router.post('/generate-description', authenticate, generateDescription)
router.get('/recommendations', authenticate, getRecommendations)

export default router
