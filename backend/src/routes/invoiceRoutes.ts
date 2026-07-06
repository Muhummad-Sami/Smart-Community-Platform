import { Router } from 'express'
import { authenticate } from '../middlewares/auth'
import prisma from '../config/database'

const router = Router()

// Generate PDF invoice for a booking
router.get('/:bookingId', authenticate, async (req, res): Promise<any> => {
  try {
    const userId = (req as any).user?.userId
    const { bookingId } = req.params

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        OR: [{ clientId: userId }, { providerId: userId }],
      },
      include: {
        service: { select: { title: true, category: true, description: true } },
        client: { select: { fullName: true, email: true } },
        provider: { select: { fullName: true, email: true } },
        payment: true,
      },
    })

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' })
    }

    const PDFDocument = require('pdfkit')
    const doc = new PDFDocument({ margin: 50, size: 'A4' })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${bookingId.slice(0, 8)}.pdf`)
    doc.pipe(res)

    // Header
    doc.rect(0, 0, doc.page.width, 90).fill('#0d1117')
    doc.fillColor('#ffffff').fontSize(26).font('Helvetica-Bold').text('INVOICE', 50, 30)
    doc.fontSize(10).font('Helvetica').fillColor('#94a3b8')
      .text('Smart Community Platform', 50, 62)

    // Invoice number & date
    doc.fillColor('#ffffff').fontSize(11)
      .text(`Invoice #: ${bookingId.slice(0, 8).toUpperCase()}`, 400, 30, { align: 'right' })
      .text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 400, 48, { align: 'right' })
      .text(`Status: ${booking.paymentStatus}`, 400, 66, { align: 'right' })

    // Divider
    doc.moveDown(3)
    doc.strokeColor('#2563eb').lineWidth(1).moveTo(50, 105).lineTo(550, 105).stroke()

    // Bill To / From
    doc.fillColor('#94a3b8').fontSize(9).font('Helvetica-Bold').text('BILL TO', 50, 120)
    doc.fillColor('#111827').fontSize(12).font('Helvetica-Bold')
      .text(booking.client.fullName, 50, 135)
    doc.fillColor('#374151').fontSize(10).font('Helvetica')
      .text(booking.client.email, 50, 152)

    doc.fillColor('#94a3b8').fontSize(9).font('Helvetica-Bold').text('SERVICE PROVIDER', 310, 120)
    doc.fillColor('#111827').fontSize(12).font('Helvetica-Bold')
      .text(booking.provider.fullName, 310, 135)
    doc.fillColor('#374151').fontSize(10).font('Helvetica')
      .text(booking.provider.email, 310, 152)

    // Table Header
    doc.rect(50, 185, 500, 30).fill('#1e293b')
    doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold')
      .text('SERVICE', 60, 195)
      .text('CATEGORY', 260, 195)
      .text('DATE', 370, 195)
      .text('AMOUNT', 480, 195, { align: 'right' })

    // Table Row
    doc.rect(50, 215, 500, 35).fill('#f8fafc')
    doc.fillColor('#111827').fontSize(10).font('Helvetica')
      .text(booking.service.title, 60, 225, { width: 180 })
      .text(booking.service.category, 260, 225)
      .text(new Date(booking.dateTime).toLocaleDateString(), 370, 225)
      .text(`$${booking.totalAmount.toFixed(2)}`, 480, 225, { align: 'right' })

    // Total
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(350, 265).lineTo(550, 265).stroke()
    doc.fillColor('#111827').fontSize(12).font('Helvetica-Bold')
      .text('TOTAL:', 380, 275)
      .text(`$${booking.totalAmount.toFixed(2)}`, 480, 275, { align: 'right' })

    // Payment status badge
    const statusColor = booking.paymentStatus === 'PAID' ? '#16a34a' : '#d97706'
    doc.rect(50, 275, 120, 25).fill(statusColor)
    doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold')
      .text(booking.paymentStatus === 'PAID' ? '✓ PAID' : '⏳ PENDING', 60, 282)

    // Notes
    if (booking.notes) {
      doc.moveDown(4)
      doc.fillColor('#94a3b8').fontSize(9).font('Helvetica-Bold').text('NOTES', 50, 320)
      doc.fillColor('#374151').fontSize(10).font('Helvetica').text(booking.notes, 50, 335)
    }

    // Footer
    doc.rect(0, doc.page.height - 60, doc.page.width, 60).fill('#0d1117')
    doc.fillColor('#4b5563').fontSize(9)
      .text('Thank you for using Smart Community Platform', 50, doc.page.height - 42, { align: 'center' })
      .text('support@smartcommunity.com | smartcommunity.com', 50, doc.page.height - 28, { align: 'center' })

    doc.end()
  } catch (error) {
    console.error('Invoice generation error:', error)
    return res.status(500).json({ success: false, error: 'Failed to generate invoice' })
  }
})

export default router
