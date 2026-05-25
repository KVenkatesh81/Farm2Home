import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

export default function TransportDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [myTrips, setMyTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('available')

  useEffect(() => { fetchTrips() }, [])

  const fetchTrips = async () => {
    try {
      const [available, my] = await Promise.all([
        api.get('/api/trips'),
        api.get('/api/trips/my')
      ])
      setTrips(available.data)
      setMyTrips(my.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleAccept = async (id) => {
    try {
      await api.post('/api/trips/' + id + '/accept')
      fetchTrips()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept trip')
    }
  }

  const handleComplete = async (id) => {
    if (!window.confirm('Mark this trip as delivered?')) return
    try {
      await api.post('/api/trips/' + id + '/complete')
      fetchTrips()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete trip')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="font-semibold text-amber-600 text-lg">🚚 Farm 2 Home</span>
        <div className="flex gap-4 items-center">
          <Link to="/transport/about" className="text-gray-600 text-sm hover:text-gray-900">About</Link>
          <span className="text-gray-500 text-sm">{user?.name}</span>
          <button onClick={() => { logout(); navigate('/login') }} className="text-red-500 text-sm">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Transport Dashboard</h1>
        <p className="text-gray-500 text-sm mb-6">Find trips and track your deliveries</p>

        <div className="flex gap-2 mb-6">
          {['available', 'my'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={'px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (tab === t ? 'bg-amber-500 text-white' : 'bg-white border border-gray-200 text-gray-600')}>
              {t === 'available' ? 'Available Trips (' + trips.length + ')' : 'My Trips (' + myTrips.length + ')'}
            </button>
          ))}
        </div>

        {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
          <div className="flex flex-col gap-4">
            {(tab === 'available' ? trips : myTrips).map(trip => (
              <TripCard key={trip._id} trip={trip} tab={tab} onAccept={handleAccept} onComplete={handleComplete} />
            ))}
            {(tab === 'available' ? trips : myTrips).length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-400">{tab === 'available' ? 'No available trips right now' : 'No trips accepted yet'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TripCard({ trip, tab, onAccept }) {
  const statusColors = {
    available: 'bg-green-100 text-green-700',
    accepted: 'bg-blue-100 text-blue-700',
    completed: 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">{trip.pickupLocation}</span>
            <span className="text-gray-400">→</span>
            <span className="text-sm font-medium text-gray-900">{trip.deliveryLocation}</span>
            <span className={'text-xs px-2 py-0.5 rounded-full ' + statusColors[trip.status]}>{trip.status}</span>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-1">
            <span>📅 {new Date(trip.date).toLocaleDateString()}</span>
            <span>⚖️ {trip.weight} kg</span>
            <span className="text-amber-600 font-semibold text-sm">₹{trip.payment}</span>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          {tab === 'available' && (
            <button onClick={() => onAccept(trip._id)}
              className="bg-amber-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-amber-600">
              Accept
            </button>
          )}
          {tab === 'my' && trip.status === 'accepted' && (
            <button onClick={() => onComplete(trip._id)}
              className="bg-green-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-600">
              Mark Delivered
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
        {trip.farmerName && (
          <span>🧑‍🌾 Farmer: <span className="text-gray-700 font-medium">{trip.farmerName}</span></span>
        )}
        {trip.buyerName && (
          <span>🛒 Buyer: <span className="text-gray-700 font-medium">{trip.buyerName}</span></span>
        )}
        {trip.buyerPhone && tab === 'my' && (
          <span>📞 Contact: <span className="text-gray-700 font-medium">{trip.buyerPhone}</span></span>
        )}
        {trip.orderId && (
          <span>🧾 Order: <span className="text-gray-700 font-medium">#{trip.orderId.toString().slice(-6).toUpperCase()}</span></span>
        )}
      </div>
    </div>
  )
}
