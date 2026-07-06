import { Request, Response } from 'express'
import prisma from '../config/database'

export const verifyUserManually = async (req: Request, res: Response) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      })
    }

    const user = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        isVerified: true,
        verificationToken: null,
      },
    })

    return res.status(200).json({
      success: true,
      message: 'User verified successfully!',
      data: { email: user.email, emailVerified: user.emailVerified }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to verify user'
    })
  }
}
