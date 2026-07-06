import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this'

export const generateToken = (userId: string, email: string, role: string) => {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET)
}
