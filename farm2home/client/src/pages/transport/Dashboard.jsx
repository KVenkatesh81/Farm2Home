import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import useRefreshOnFocus from '../../hooks/useRefreshOnFocus'

const BACKEND = 'https://farm2home-ai.onrender.com'

export default function TransportDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [myTrips, setMyTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('available')

  const getHeaders = () => ({ Authorization: 'Bearer ' + localStorage.getItem('token') })

  const fetchTrips = useCallback(async () => {
    try {
      const [r1, r2] = await Promise.all([
        fetch(BACKEND + '/api/trips', { headers: getHeaders() }),
        fetch(BACKEND + '/api/trips/my', { headers: getHeaders() })
      ])
      const [available, my] = await Promise.all([r1.json(), r2.json()])
      setTrips(Array.isArray(available) ? available : [])
      setMyTrips(Array.isArray(my) ? my : [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useRefreshOnFocus(fetchTrips)
  useEffect(() => { fetchTrips() }, [fetchTrips])

  const handleAccept = async (id) => {
    try {
      const res = await fetch(BACKEND + '/api/trips/' + id + '/accept', { method: 'POST', headers: getHeaders() })
      const data = await res.json()
      if (!res.ok) return alert(data.message || 'Failed to accept')
      fetchTrips()
    } catch (err) { alert('Failed to accept trip') }
  }

  const handleComplete = async (id) => {
    if (!window.confirm('Mark this trip as delivered?')) return
    try {
      const res = await fetch(BACKEND + '/api/trips/' + id + '/complete', { method: 'POST', headers: getHeaders() })
      const data = await res.json()
      if (!res.ok) return alert(data.message || 'Failed to complete')
      alert('Trip marked as delivered!')
      fetchTrips()
    } catch (err) { alert('Failed to complete trip') }
  }

  const statusColors = { available: 'bg-green-100 text-green-700', accepted: 'bg-blue-100 text-blue-700', completed: 'bg-gray-100 text-gray-600' }
  const displayTrips = tab === 'available' ? trips : myTrips

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="font-semibold text-amber-600 text-lg">🚚 Farm 2 Home</span>
        <div className="flex gap-4 items-center">
          <Link to="/transport/about" className="text-gray-600 text-sm">About</Link>
          <span className="text-gray-500 text-sm">{user?.name}</span>
          <button onClick={() => { logout(); navigate('/login') }} className="text-red-500 text-sm">Logout</button>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Transport Dashboard</h1>
        <p className="text-gray-500 text-sm mb-6">Find trips and track your deliveries</p>
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('available')}
            className={'px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (tab === 'available' ? 'bg-amber-500 text-white' : 'bg-white border border-gray-200 text-gray-600')}>
            Available Trips ({trips.length})
          </button>
          <button onClick={() => setTab('my')}
            className={'px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (tab === 'my' ? 'bg-amber-500 text-white' : 'bg-white border border-gray-200 text-gray-600')}>
            My Trips ({myTrips.length})
          </button>
        </div>
        {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
          <div className="flex flex-col gap-4">
            {displayTrips.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-400">{tab === 'available' ? 'No available trips right now' : 'No trips accepted yet'}</p>
              </div>
            )}
            {displayTrips.map(trip => (
              <div key={trip._id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">📍 {trip.pickupLocation}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-sm font-medium text-gray-900">🏠 {trip.deliveryLocation}</span>
                      <span className={'text-xs px-2 py-0.5 rounded-full ' + statusColors[trip.status]}>{trip.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-1">
                      <span>📅 {new Date(trip.date).toLocaleDateString()}</span>
                      <span>⚖️ {trip.weight} kg</span>
                      <span className="text-amber-600 font-semibold text-sm">₹{trip.payment}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    {tab === 'available' && (
                      <button onClick={() => handleAccept(trip._id)}
                        className="bg-amber-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-amber-600">
                        Accept
                      </button>
                    )}
                    {tab === 'my' && trip.status === 'accepted' && (
                      <button onClick={() => handleComplete(trip._id)}
                        className="bg-green-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-600">
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  {trip.farmerName && <span>🧑‍🌾 Farmer: <span className="text-gray-700 font-medium">{trip.farmerName}</span></span>}
                  {trip.farmerPhone && <span>📞 Farmer: <span className="text-gray-700 font-medium">{trip.farmerPhone}</span></span>}
                  {trip.buyerName && <span>🛒 Buyer: <span className="text-gray-700 font-medium">{trip.buyerName}</span></span>}
                  {trip.buyerPhone && <span>📞 Buyer: <span className="text-gray-700 font-medium">{trip.buyerPhone}</span></span>}
                  {trip.products && <span className="col-span-2">📦 Products: <span className="text-gray-700 font-medium">{trip.products}</span></span>}
                  {trip.orderId && <span>🧾 Order: <span className="text-gray-700 font-medium">#{trip.orderId.toString().slice(-6).toUpperCase()}</span></span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
