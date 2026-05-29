import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import useRefreshOnFocus from '../../hooks/useRefreshOnFocus'

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const loadOrders = () => {
    api.get('/api/orders/my')
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useRefreshOnFocus(loadOrders)
  useEffect(() => { loadOrders() }, [])

  const statusColors = {
    placed: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    out_for_delivery: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
  }

  const statusLabels = {
    placed: 'Order placed',
    confirmed: 'Confirmed',
    out_for_delivery: 'Out for delivery',
    delivered: 'Delivered',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="font-semibold text-teal-600 text-lg">🛒 Farm2Home</span>
        <Link to="/buyer" className="text-gray-500 text-sm">← Back to products</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">My orders</h1>

        {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
          orders.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg mb-4">No orders yet</p>
              <Link to="/buyer" className="bg-teal-500 text-white px-6 py-2.5 rounded-lg text-sm">Start shopping</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map(order => (
                <div key={order._id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Order #{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={'text-xs px-2 py-0.5 rounded-full ' + (statusColors[order.deliveryStatus] || 'bg-gray-100 text-gray-500')}>
                        {statusLabels[order.deliveryStatus] || order.deliveryStatus}
                      </span>
                      <span className="text-xs text-gray-500">💵 Cash on Delivery</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        {item.image
                          ? <img src={item.image} className="w-10 h-10 rounded-lg object-cover"/>
                          : <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">🌾</div>
                        }
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.quantity} {item.unit} · by {item.farmerName}</p>
                          {item.farmerPhone && (
                            <p className="text-xs text-gray-400">📞 Farmer: {item.farmerPhone}</p>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                    <p className="text-xs text-gray-500">📍 {order.deliveryAddress}</p>
                    <p className="font-semibold text-teal-600">₹{order.totalAmount}</p>
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
