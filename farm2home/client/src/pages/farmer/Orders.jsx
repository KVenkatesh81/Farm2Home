import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import useRefreshOnFocus from '../../hooks/useRefreshOnFocus'

const BACKEND = 'https://farm2home-ai.onrender.com'

export default function FarmerOrders() {
  const { } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const loadOrders = () => {
    fetch(BACKEND + '/api/orders/farmer', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    })
    .then(r => r.json())
    .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false) })
    .catch(() => setLoading(false))
  }

  useRefreshOnFocus(loadOrders)
  useEffect(() => { loadOrders() }, [])

  const statusColors = {
    placed: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    out_for_delivery: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="font-semibold text-green-700 text-lg">🌾 Farm 2 Home</span>
        <Link to="/farmer" className="text-gray-500 text-sm">← Dashboard</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Received Orders</h1>
        {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
          orders.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg mb-2">No orders yet</p>
              <p className="text-gray-400 text-sm">Orders from buyers will appear here</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map(order => (
                <div key={order._id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Order #{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={'text-xs px-2 py-0.5 rounded-full ' + (statusColors[order.deliveryStatus] || 'bg-gray-100 text-gray-600')}>
                      {order.deliveryStatus}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 mb-3">
                    {order.items
                      .filter(item => item.farmerId?.toString() === JSON.parse(localStorage.getItem('user') || '{}')?.id)
                      .map((item, i) => (
                        <div key={i} className="flex gap-3 items-center">
                          {item.image
                            ? <img src={item.image} className="w-10 h-10 rounded-lg object-cover"/>
                            : <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">🌾</div>
                          }
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.quantity} {item.unit} · ₹{item.price * item.quantity}</p>
                          </div>
                        </div>
                      ))
                    }
                  </div>

                  <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <span>🛒 Buyer: <span className="text-gray-700 font-medium">{order.buyerName}</span></span>
                    <span>📞 Phone: <span className="text-gray-700 font-medium">{order.phone}</span></span>
                    <span className="col-span-2">📍 Deliver to: <span className="text-gray-700">{order.deliveryAddress}</span></span>
                    <span>💰 Total: <span className="text-green-600 font-semibold">₹{order.totalAmount}</span></span>
                    <span>💵 {order.paymentMethod}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
