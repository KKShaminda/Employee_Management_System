import mongoose from 'mongoose'

const LeaveSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalDays: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  auditLog: [{ message: String, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, at: Date }]
}, { timestamps: true })

const Leave = mongoose.model('Leave', LeaveSchema)
export default Leave
