import { Router } from 'express'

const router = Router()

// ✅ Fixed - '_req' tells TypeScript it's intentionally unused
router.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Smart Community API is running',
    timestamp: new Date().toISOString()
  })
})

export default router