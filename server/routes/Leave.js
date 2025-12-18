import express from 'express'
import { body, validationResult } from 'express-validator'
import Leave from '../models/Leave.js'
import { auth, requireRole } from '../middleware/auth.js'

const router = express.Router()

const computeTotalDays = (start, end) => {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((end - start) / msPerDay) + 1
}

// Employee: create leave
router.post('/',
  auth,
  requireRole('employee'),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('reason').isString().isLength({ min: 3 }),
  async (req, res) => {
    const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    try {
      const { startDate, endDate, reason } = req.body
      const s = new Date(startDate); const e = new Date(endDate)
      if (e < s) return res.status(400).json({ message: 'End date cannot be before start date' })
      const totalDays = computeTotalDays(s, e)
      const leave = await Leave.create({ user: req.user._id, startDate: s, endDate: e, reason, totalDays })
      res.status(201).json(leave)
    } catch (err) { res.status(500).json({ message: err.message }) }
  })

// Employee: get own leaves
router.get('/my-leaves', auth, requireRole('employee'), async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(leaves)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Admin: get all leaves
router.get('/all', auth, requireRole('admin'), async (req, res) => {
  try {
    const leaves = await Leave.find().populate('user', 'name email role').sort({ createdAt: -1 })
    res.json(leaves)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Admin: update status
router.put('/:id/status', auth, requireRole('admin'), body('status').isIn(['Approved', 'Rejected']), async (req, res) => {
  try {
    const { id } = req.params; const { status } = req.body
    const leave = await Leave.findById(id)
    if (!leave) return res.status(404).json({ message: 'Leave not found' })
    leave.status = status
    leave.approvedBy = req.user._id
    leave.auditLog.push({ message: `Admin ${req.user.email} set status to ${status}`, by: req.user._id, at: new Date() })
    await leave.save()
    res.json(leave)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

export default router
