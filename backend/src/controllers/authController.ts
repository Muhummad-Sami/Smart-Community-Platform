import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import prisma from '../config/database'
import { generateToken } from '../config/jwt'
import { sendPasswordResetEmail } from '../services/emailService'

// Register - Auto verify users with role support
export const register = async (req: Request, res: Response) => {
  try {
    // ✅ Get role from request body, default to 'USER'
    const { email, password, fullName, username, role } = req.body

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username: username || undefined }]
      }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // ✅ Use the role from request, default to 'USER'
    const userRole = role || 'USER'

    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        password: hashedPassword,
        fullName,
        username: username || email.split('@')[0],
        role: userRole,
        isVerified: true,
        emailVerified: true,
      },
    })

    // Generate token immediately
    const token = generateToken(user.id, user.email, user.role)

    const { password: _, ...userData } = user

    return res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      data: {
        user: userData,
        token
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({
      success: false,
      error: 'Registration failed'
    })
  }
}

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
    }

    // Auto-verify if not verified (for existing users)
    if (!user.emailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          isVerified: true,
        },
      })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    const token = generateToken(user.id, user.email, user.role)

    const { password: _, ...userData } = user

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      success: false,
      error: 'Login failed'
    })
  }
}

// Verify Email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token required'
      })
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token as string }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired verification token'
      })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        isVerified: true,
        verificationToken: null,
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now login.'
    })

  } catch (error) {
    console.error('Verification error:', error)
    return res.status(500).json({
      success: false,
      error: 'Verification failed'
    })
  }
}

// Forgot Password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No user found with this email'
      })
    }

    const resetToken = uuidv4()
    const resetExpires = new Date()
    resetExpires.setHours(resetExpires.getHours() + 1)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    })

    await sendPasswordResetEmail(email, resetToken, user.fullName)

    return res.status(200).json({
      success: true,
      message: 'Password reset email sent. Please check your inbox.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to process request'
    })
  }
}

// Reset Password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password are required'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      })
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now login.'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    })
  }
}

// Get Profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        profilePicture: true,
        bio: true,
        location: true,
        phone: true,
        role: true,
        isVerified: true,
        emailVerified: true,
        createdAt: true,
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    return res.status(200).json({
      success: true,
      data: user
    })

  } catch (error) {
    console.error('Get profile error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    })
  }
}