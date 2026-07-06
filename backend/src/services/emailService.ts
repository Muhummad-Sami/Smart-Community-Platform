import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  connectionTimeout: 5000, // Fail fast after 5 seconds instead of hanging
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Simple send email
export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@smartcommunity.com',
      to,
      subject,
      text,
    })
    console.log('Email sent to:', to)
    return true
  } catch (error) {
    console.error('Email error:', error)
    return false
  }
}

// Verification email
export const sendVerificationEmail = async (email: string, token: string, fullName: string) => {
  const url = process.env.FRONTEND_URL + '/verify-email?token=' + token
  const text = 'Hi ' + fullName + ',\n\nPlease verify your email by clicking this link:\n' + url + '\n\nThis link expires in 24 hours.'
  return sendEmail(email, 'Verify Your Email', text)
}

// Password reset email
export const sendPasswordResetEmail = async (email: string, token: string, fullName: string) => {
  const url = process.env.FRONTEND_URL + '/reset-password?token=' + token
  const text = 'Hi ' + fullName + ',\n\nReset your password by clicking this link:\n' + url + '\n\nThis link expires in 1 hour.'
  return sendEmail(email, 'Reset Your Password', text)
}

// Booking notification email
export const sendBookingNotification = async (email: string, fullName: string, bookingDetails: any) => {
  const text = `Hi ${fullName},\n\nYou have a new update regarding your booking for "${bookingDetails.serviceName}".\n\nStatus: ${bookingDetails.status}\nDate: ${bookingDetails.date}\nTotal: $${bookingDetails.total}\n\nPlease check your dashboard for more details.`
  return sendEmail(email, 'Booking Update - Smart Community', text)
}

// Payment receipt email
export const sendPaymentReceipt = async (email: string, fullName: string, amount: number, bookingId: string) => {
  const text = `Hi ${fullName},\n\nWe have received your payment of $${amount} for booking #${bookingId}.\n\nThank you for using Smart Community Platform.`
  return sendEmail(email, 'Payment Receipt - Smart Community', text)
}
