import { Router } from 'express'
import { authenticate } from '../middlewares/auth'
import prisma from '../config/database'

const router = Router()

// QR Code for a service - returns base64 PNG
router.get('/service/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params
    const service = await prisma.service.findUnique({
      where: { id },
      select: { id: true, title: true },
    })
    if (!service) return res.status(404).json({ success: false, error: 'Service not found' })

    const QRCode = require('qrcode')
    const url = `${process.env.FRONTEND_URL}/services/${id}`
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: { dark: '#0d1117', light: '#ffffff' },
    })

    return res.status(200).json({ success: true, data: { qrCode: qrDataUrl, url, title: service.title } })
  } catch (error) {
    console.error('QR generation error:', error)
    return res.status(500).json({ success: false, error: 'Failed to generate QR code' })
  }
})

export default router
