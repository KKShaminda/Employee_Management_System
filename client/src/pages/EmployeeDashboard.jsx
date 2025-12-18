import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const EmployeeDashboard = () => {
  const [leaves, setLeaves] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const token = localStorage.getItem('token')
  const name = localStorage.getItem('name') || ''
  const navigate = useNavigate()

  const load = async () => {
    if (!token) return navigate('/login')
    try {
      const res = await fetch('http://localhost:3000/leaves/my-leaves', { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: 'Failed to parse error' }))
        throw new Error(body.message || 'Failed to load')
      }
      const data = await res.json()
      setLeaves(data)
    } catch (err) { console.error(err); alert('Unable to load your leaves: ' + err.message) }
  }

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!token) return navigate('/login')
    try {
      const res = await fetch('http://localhost:3000/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ startDate, endDate, reason })
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        const msg = body?.message || (body?.errors ? body.errors.map(e => e.msg).join(', ') : 'Apply failed')
        throw new Error(msg)
      }
      setStartDate(''); setEndDate(''); setReason('')
      await load()
      alert('Leave applied successfully')
    } catch (err) { console.error(err); alert('Failed to apply leave: ' + err.message) }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('name')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Employee Dashboard</h1>
          <div className="text-sm text-gray-600">Logged in as <strong>{name || 'Employee'}</strong> <button onClick={handleLogout} className="ml-3 text-blue-600">Logout</button></div>
        </div>

        <form onSubmit={submit} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-sm text-gray-700">Start Date</label>
            <input className="mt-1 p-2 border rounded w-full" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-gray-700">End Date</label>
            <input className="mt-1 p-2 border rounded w-full" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Reason</label>
            <input className="mt-1 p-2 border rounded w-full" value={reason} onChange={(e) => setReason(e.target.value)} required />
          </div>
          <div className="md:col-span-3">
            <button type="submit" className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded">Apply Leave</button>
          </div>
        </form>

        <h2 className="text-xl font-semibold mb-2">My Leaves</h2>
        <ul>
          {leaves.map(l => (
            <li key={l._id} className="mb-2 border-b py-2">
              <div className="text-sm text-gray-700">{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</div>
              <div className="text-sm text-gray-600">{l.totalDays} days · {l.status}</div>
              <div className="text-sm">Reason: {l.reason}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default EmployeeDashboard
