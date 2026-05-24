import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../utils/api'

export default function OrderSuccess() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    api.get(`/api/orders/${id}`).then(res => setOrder(res.data)).catch(console.error)
  }, [id])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl border border-gray-200 p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Order placed!</h1>
        <p className="text-gray-500 text-sm mb-6">
          Your fresh farm products are on their way.
        </p>

        {order && (
          <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Order ID</span>
              <span className="font-mono text-xs text-gray-700">{order._id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Total</span>
              <span className="font-semibold text-teal-600">₹{order.totalAmount}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Payment</span>
              <span className="text-gray-700">Cash on Delivery</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Deliver to</span>
              <span className="text-gray-700 text-right max-w-40">{order.deliveryAddress}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Link to="/buyer/orders"
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50">
            My orders
          </Link>
          <Link to="/buyer"
            className="flex-1 bg-teal-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-teal-600">
            Shop more
          </Link>
        </div>
      </div>
    </div>
  )
}