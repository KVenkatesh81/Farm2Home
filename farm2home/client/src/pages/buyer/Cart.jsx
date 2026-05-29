import { useCart } from '../../context/CartContext'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <span className="font-semibold text-teal-600 text-lg">🛒 Farm2Home</span>
          <Link to="/buyer" className="text-gray-500 text-sm">← Back to products</Link>
        </nav>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="text-5xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mb-6">Add some fresh products from the farm</p>
          <Link to="/buyer" className="bg-teal-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-600">
            Browse products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="font-semibold text-teal-600 text-lg">🛒 Farm 2 Home</span>
        <Link to="/buyer" className="text-gray-500 text-sm">← Continue shopping</Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Your cart</h1>
          <button onClick={clearCart} className="text-red-400 text-sm hover:text-red-600">
            Clear all
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart items */}
          <div className="flex-1 flex flex-col gap-3">
            {cart.map(item => (
              <div key={item._id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-center">
                {item.images?.[0]
                  ? <img src={item.images[0]} alt={item.title} className="w-16 h-16 object-cover rounded-lg"/>
                  : <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">🌾</div>
                }
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-gray-500">by {item.farmerName}</p>
                  <p className="text-teal-600 font-semibold text-sm mt-1">₹{item.price}/{item.unit}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="w-7 h-7 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">
                    −
                  </button>
                  <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="w-7 h-7 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">
                    +
                  </button>
                </div>
                <div className="text-right min-w-16">
                  <p className="font-semibold text-gray-900 text-sm">₹{item.price * item.quantity}</p>
                  <button onClick={() => removeFromCart(item._id)}
                    className="text-xs text-red-400 hover:text-red-600 mt-1">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:w-72">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
              <h2 className="font-semibold text-gray-900 mb-4">Order summary</h2>
              <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
                {cart.map(item => (
                  <div key={item._id} className="flex justify-between">
                    <span>{item.title} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold text-gray-900 mb-4">
                <span>Total</span>
                <span className="text-teal-600">₹{cartTotal}</span>
              </div>
              <div className="bg-teal-50 rounded-lg p-3 text-xs text-teal-700 mb-4">
                💵 Cash on delivery — pay when your order arrives
              </div>
              <button onClick={() => navigate('/buyer/checkout')}
                className="w-full bg-teal-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-teal-600">
                Proceed to checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}