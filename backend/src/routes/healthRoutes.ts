import { Router } from 'express'

const router = Router()

router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Smart Community API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    })
})

export default router