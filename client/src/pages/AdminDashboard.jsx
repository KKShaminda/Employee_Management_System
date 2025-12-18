import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const StatusBadge = ({ status }) => {
  const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium'
  if (status === 'Approved') return <span className={`${base} bg-green-100 text-green-800`}>Approved</span>
  if (status === 'Rejected') return <span className={`${base} bg-red-100 text-red-800`}>Rejected</span>
  return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending</span>
}

const AdminDashboard = () => {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')
  const name = localStorage.getItem('name') || ''
  const navigate = useNavigate()

  const load = async () => {
    try {
      const res = await fetch('http://localhost:3000/leaves/all', { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setLeaves(data)
    } catch (err) {
      console.error(err)
      alert('Unable to load leaves')
    } finally { setLoading(false) }
  }

  useEffect(() => { if (!token) navigate('/login'); else load() }, [])

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:3000/leaves/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error('Update failed')
      load()
    } catch (err) { console.error(err); alert('Failed to update status') }
  }

  // Add employee form state
  const [empName, setEmpName] = useState('')
  const [empEmail, setEmpEmail] = useState('')
  const [empPassword, setEmpPassword] = useState('')

  const createEmployee = async (e) => {
    e.preventDefault()
    if (!token) return navigate('/login')
    try {
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: empName, email: empEmail, password: empPassword })
      })
      if (!res.ok) {
        const err = await res.json().catch(()=>null)
        const msg = err?.message || (err?.errors ? err.errors.map(e=>e.msg).join(', ') : 'Failed')
        throw new Error(msg)
      }
      alert('Employee created')
      setEmpName(''); setEmpEmail(''); setEmpPassword('')
    } catch (err) { console.error(err); alert('Failed to create employee: ' + err.message) }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('name')
    navigate('/login')
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <div className="text-sm text-gray-600">Logged in as <strong>{name || 'Admin'}</strong> <button onClick={handleLogout} className="ml-3 text-blue-600">Logout</button></div>
        </div>

        <section className="mb-6">
          <h2 className="text-lg font-medium mb-2">Add Employee</h2>
          <form onSubmit={createEmployee} className="mb-4 flex flex-wrap gap-2 items-center">
            <input className="p-2 border rounded" placeholder="Name" value={empName} onChange={(e)=>setEmpName(e.target.value)} required />
            <input className="p-2 border rounded" placeholder="Email" type="email" value={empEmail} onChange={(e)=>setEmpEmail(e.target.value)} required />
            <input className="p-2 border rounded" placeholder="Password" type="password" value={empPassword} onChange={(e)=>setEmpPassword(e.target.value)} required />
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Create</button>
          </form>
        </section>

        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 bg-white rounded">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Range</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {leaves.map((l, idx) => (
                <tr key={l._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-sm text-gray-700">{l.user?.name ?? l.user?.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{l.totalDays}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{l.reason}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="px-4 py-3">
                    {l.status === 'Pending' ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateStatus(l._id, 'Approved')} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm">Approve</button>
                        <button onClick={() => updateStatus(l._id, 'Rejected')} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm">Reject</button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
