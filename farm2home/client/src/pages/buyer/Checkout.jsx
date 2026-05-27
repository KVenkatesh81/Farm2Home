import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

const BACKEND = 'https://bug-free-yodel-4j94ww6v69q7c56-5000.app.github.dev'

export default function Checkout() {
  const { user } = useAuth()
  const { cart, cartTotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (cart.length === 0) return setError('Your cart is empty')
    setLoading(true)
    setError('')
    try {
      const items = cart.map(item => ({
        productId: item._id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        image: item.images?.[0] || '',
        farmerName: item.farmerName,
        farmerId: item.farmerId,
        farmerLocation: item.farmerLocation || '',
      }))

      const deliveryAddress = form.address + ', ' + form.city + ' - ' + form.pincode

      const token = localStorage.getItem('token')
      const response = await fetch(BACKEND + '/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ items, deliveryAddress, phone: form.phone })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to place order')

      clearCart()
      navigate('/buyer/order-success/' + data._id)
    } catch (err) {
      setError(err.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link to="/buyer" className="text-teal-600 text-sm">Browse products</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="font-semibold text-teal-600 text-lg">🛒 Farm 2 Home</span>
        <Link to="/buyer/cart" className="text-gray-500 text-sm">← Back to cart</Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Checkout</h1>
        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Delivery details</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Full name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-500"/>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Phone number</label>
                  <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    placeholder="10-digit mobile number"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-500"/>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Street address</label>
                  <textarea required value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                    placeholder="House no, street, area" rows={2}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-500 resize-none"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">City</label>
                    <input required value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                      placeholder="e.g. Chennai"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-500"/>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Pincode</label>
                    <input required value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})}
                      placeholder="e.g. 600001"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-500"/>
                  </div>
                </div>
                <div className="bg-teal-50 rounded-lg p-4 flex items-start gap-3 mt-2">
                  <span className="text-2xl">💵</span>
                  <div>
                    <p className="font-medium text-teal-800 text-sm">Cash on Delivery</p>
                    <p className="text-teal-600 text-xs mt-0.5">Pay ₹{cartTotal} when your order arrives</p>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="bg-teal-500 text-white py-3 rounded-lg text-sm font-medium hover:bg-teal-600 disabled:opacity-50 mt-2">
                  {loading ? 'Placing order...' : 'Place order · ₹' + cartTotal}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:w-72">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Order summary</h2>
              <div className="flex flex-col gap-3">
                {cart.map(item => (
                  <div key={item._id} className="flex gap-3 items-center">
                    {item.images?.[0]
                      ? <img src={item.images[0]} className="w-10 h-10 rounded-lg object-cover"/>
                      : <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">🌾</div>
                    }
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">× {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-teal-600">₹{cartTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
