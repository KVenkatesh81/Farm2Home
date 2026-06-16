import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const BACKEND = 'https://farm2home-ai.onrender.com'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('pending')
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [embedStatus, setEmbedStatus] = useState(null)
  const [message, setMessage] = useState('')

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + localStorage.getItem('token')
  })

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(BACKEND + '/api/admin/stats', { headers: getHeaders() })
      const data = await res.json()
      setStats(data)
    } catch (err) { console.error(err) }
  }, [])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      let url = BACKEND + '/api/admin/users'
      if (tab === 'pending') url += '?status=pending'
      else if (tab === 'verified') url += '?status=verified'
      else if (tab === 'rejected') url += '?status=rejected'
      else if (tab === 'transport') url += '?role=transport'
      const res = await fetch(url, { headers: getHeaders() })
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [tab])

  useEffect(() => { fetchStats(); fetchUsers() }, [fetchStats, fetchUsers])

  const handleVerify = async (id) => {
    try {
      const res = await fetch(BACKEND + '/api/admin/verify-user/' + id, { method: 'PATCH', headers: getHeaders() })
      const data = await res.json()
      setMessage(data.message)
      fetchUsers(); fetchStats()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) { console.error(err) }
  }

  const handleReject = async () => {
    try {
      const res = await fetch(BACKEND + '/api/admin/reject-user/' + rejectModal, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ reason: rejectReason })
      })
      const data = await res.json()
      setMessage(data.message)
      setRejectModal(null)
      setRejectReason('')
      fetchUsers(); fetchStats()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) { console.error(err) }
  }

  const handleVerifyLicence = async (id) => {
    try {
      const res = await fetch(BACKEND + '/api/admin/verify-licence/' + id, { method: 'PATCH', headers: getHeaders() })
      const data = await res.json()
      setMessage(data.message)
      fetchUsers()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) { console.error(err) }
  }

  const handleEmbed = async () => {
    try {
      const res = await fetch(BACKEND + '/api/admin/embed-products', { method: 'POST', headers: getHeaders() })
      const data = await res.json()
      setMessage(data.message)
      setTimeout(() => setMessage(''), 5000)
    } catch (err) { console.error(err) }
  }

  const handleEmbedStatus = async () => {
    try {
      const res = await fetch(BACKEND + '/api/admin/embed-status', { headers: getHeaders() })
      const data = await res.json()
      setEmbedStatus(data)
    } catch (err) { console.error(err) }
  }

  const statusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      verified: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    }
    return <span className={'text-xs px-2 py-0.5 rounded-full ' + colors[status]}>{status}</span>
  }

  const roleBadge = (role) => {
    const colors = {
      farmer: 'bg-green-100 text-green-700',
      transport: 'bg-amber-100 text-amber-700',
      buyer: 'bg-teal-100 text-teal-700'
    }
    return <span className={'text-xs px-2 py-0.5 rounded-full capitalize ' + colors[role]}>{role}</span>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-lg">🌾 Farm 2 Home</span>
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Admin Panel</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm">👤 {user?.name}</span>
          <button onClick={() => { logout(); navigate('/login') }} className="text-red-500 text-sm">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Admin Dashboard</h1>

        {message && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{message}</div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers, color: 'text-indigo-600' },
              { label: 'Pending', value: stats.pendingUsers, color: 'text-yellow-600' },
              { label: 'Products', value: stats.totalProducts, color: 'text-green-600' },
              { label: 'Orders', value: stats.totalOrders, color: 'text-teal-600' },
              { label: 'Trips', value: stats.totalTrips, color: 'text-amber-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className={'text-3xl font-bold ' + s.color}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'pending', label: '⏳ Pending Verification' },
            { key: 'verified', label: '✅ Verified Users' },
            { key: 'rejected', label: '❌ Rejected Users' },
            { key: 'transport', label: '🚚 Transport Licences' },
            { key: 'embed', label: '🤖 AI Embeddings' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={'px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (tab === t.key ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Embed tab */}
        {tab === 'embed' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">🤖 AI Embeddings Manager</h2>
            <div className="flex gap-3 mb-4">
              <button onClick={handleEmbedStatus}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                Check Status
              </button>
              <button onClick={handleEmbed}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                Embed Unembedded Products
              </button>
            </div>
            {embedStatus && (
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <p>Total products: <strong>{embedStatus.total}</strong></p>
                <p>Embedded: <strong className="text-green-600">{embedStatus.embedded}</strong></p>
                <p>Not embedded: <strong className="text-red-600">{embedStatus.total - embedStatus.embedded}</strong></p>
                {embedStatus.notEmbedded.length > 0 && (
                  <p className="mt-2 text-gray-500">Missing: {embedStatus.notEmbedded.join(', ')}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Users tab */}
        {tab !== 'embed' && (
          <div className="flex flex-col gap-3">
            {loading && <p className="text-gray-400 text-sm">Loading...</p>}
            {!loading && users.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-400">No users found</p>
              </div>
            )}
            {users.map(u => (
              <div key={u._id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{u.name}</p>
                      {roleBadge(u.role)}
                      {statusBadge(u.verificationStatus)}
                    </div>
                    <p className="text-sm text-gray-500">{u.email}</p>
                    {u.phone && <p className="text-xs text-gray-400 mt-0.5">📞 {u.phone}</p>}
                    {u.location && <p className="text-xs text-gray-400">📍 {u.location}</p>}
                    {u.licenceNumber && <p className="text-xs text-gray-400">🪪 Licence: {u.licenceNumber}</p>}
                    {u.rejectionReason && <p className="text-xs text-red-500 mt-1">Rejection reason: {u.rejectionReason}</p>}
                    <p className="text-xs text-gray-400 mt-1">Joined: {new Date(u.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex flex-col gap-2 items-end ml-4">
                    {/* User verification buttons */}
                    {u.verificationStatus === 'pending' && (
                      <>
                        <button onClick={() => handleVerify(u._id)}
                          className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs hover:bg-green-600">
                          ✓ Verify User
                        </button>
                        <button onClick={() => setRejectModal(u._id)}
                          className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs hover:bg-red-600">
                          ✗ Reject User
                        </button>
                      </>
                    )}
                    {u.verificationStatus === 'verified' && (
                      <button onClick={() => setRejectModal(u._id)}
                        className="border border-red-300 text-red-500 px-4 py-1.5 rounded-lg text-xs hover:bg-red-50">
                        Revoke Access
                      </button>
                    )}
                    {u.verificationStatus === 'rejected' && (
                      <button onClick={() => handleVerify(u._id)}
                        className="border border-green-300 text-green-600 px-4 py-1.5 rounded-lg text-xs hover:bg-green-50">
                        Re-verify
                      </button>
                    )}

                    {/* Licence buttons for transport */}
                    {u.role === 'transport' && u.licenceUrl && (
                      <a href={u.licenceUrl} target="_blank"
                        className="text-xs text-indigo-600 underline">View Licence</a>
                    )}
                    {u.role === 'transport' && !u.licenceVerified && u.licenceUrl && (
                      <button onClick={() => handleVerifyLicence(u._id)}
                        className="bg-amber-500 text-white px-4 py-1.5 rounded-lg text-xs hover:bg-amber-600">
                        ✓ Verify Licence
                      </button>
                    )}
                    {u.role === 'transport' && u.licenceVerified && (
                      <span className="text-xs text-green-600 font-medium">✓ Licence Verified</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="font-semibold text-gray-900 mb-4">Rejection Reason</h3>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection (optional)..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-red-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason('') }}
                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleReject}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
