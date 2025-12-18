import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (!header) return res.status(401).json({ message: 'No token provided' })
    const token = header.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret')
    const user = await User.findById(decoded.id).select('-password')
    if (!user) return res.status(401).json({ message: 'Invalid token' })
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized', error: err.message })
  }
}

const requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
  if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden: insufficient role' })
  next()
}

export { auth, requireRole }
