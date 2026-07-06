import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../config/jwt'

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No token provided'
      })
      return
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token) as any

    ;(req as any).user = decoded
    next()
    return

  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    })
    return
  }
}
