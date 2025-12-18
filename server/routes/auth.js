import express from 'express'
import User from '../models/User.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { auth, requireRole } from '../middleware/auth.js'

const router = express.Router()

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ message: 'Invalid credentials' })
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '8h' })
    res.json({ token, user: { id: user._id, email: user.email, role: user.role, name: user.name } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin-only: create an employee user
router.post('/register',
  auth,
  requireRole('admin'),
  body('name').isString().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    try {
      const { name, email, password } = req.body
      const exists = await User.findOne({ email })
      if (exists) return res.status(400).json({ message: 'User with this email already exists' })
      const hash = await bcrypt.hash(password, 10)
      const user = new User({ name, email, password: hash, role: 'employee' })
      await user.save()
      res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role })
    } catch (err) { res.status(500).json({ message: err.message }) }
  }
)

export default router
