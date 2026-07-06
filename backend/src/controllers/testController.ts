import { Request, Response } from 'express'
import { sendEmail } from '../services/emailService'

export const testEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      })
    }

    const result = await sendEmail(
      email,
      'Test Email - Smart Community',
      '<h1>? Email is working!</h1><p>Your email configuration is correct.</p>'
    )

    if (result) {
      return res.status(200).json({
        success: true,
        message: 'Test email sent successfully!'
      })
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to send test email'
      })
    }
  } catch (error) {
    console.error('Test email error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to send test email'
    })
  }
}
