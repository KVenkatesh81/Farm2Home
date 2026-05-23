import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import api from '../../utils/api'

export default function BuyerDashboard() {
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [maxPrice, setMaxPrice] = useState(1000)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [search, category, maxPrice, products])

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/products')
      setProducts(res.data)
      setFiltered(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let result = [...products]
    if (search) result = result.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    )
    if (category) result = result.filter(p => p.category === category)
    result = result.filter(p => p.price <= maxPrice)
    setFiltered(result)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="font-semibold text-teal-600 text-lg">🛒 Farm 2 Home</span>
        <div className="flex gap-4 items-center">
          <Link to="/buyer/cart" className="relative text-gray-600 text-sm hover:text-gray-900">
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-teal-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <Link to="/buyer/orders" className="text-gray-600 text-sm">Orders</Link>
          <Link to="/buyer/about" className="text-gray-600 text-sm">About</Link>
          <span className="text-gray-500 text-sm">{user?.name}</span>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-red-500 text-sm">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Fresh from the farm</h1>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-4 items-center">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-teal-500 flex-1 min-w-48"/>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-teal-500">
            <option value="">All categories</option>
            {['vegetables','fruits','grains','dairy','spices','poultry','fishery','other'].map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Max price:</span>
            <input type="range" min="10" max="1000" value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-24 accent-teal-500"/>
            <span className="text-sm font-medium text-teal-600">₹{maxPrice}</span>
          </div>
          {(search || category) && (
            <button onClick={() => { setSearch(''); setCategory(''); setMaxPrice(1000); }}
              className="text-sm text-red-400 hover:text-red-600">Clear</button>
          )}
        </div>

        {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
          <>
            <p className="text-sm text-gray-500 mb-4">{filtered.length} products found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg">No products found</p>
                <button onClick={() => { setSearch(''); setCategory(''); setMaxPrice(1000); }}
                  className="mt-4 text-teal-600 text-sm">Clear filters</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ProductCard({ product: p }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addToCart(p)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {p.images?.[0]
        ? <img src={p.images[0]} alt={p.title} className="w-full h-44 object-cover"/>
        : <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-3xl">🌾</div>
      }
      <div className="p-4">
        <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full capitalize">{p.category}</span>
        <h3 className="font-medium text-gray-900 mt-2 mb-1">{p.title}</h3>
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{p.description}</p>
        <p className="text-xs text-gray-400 mb-3">by {p.farmerName}</p>
        <div className="flex justify-between items-center">
          <span className="text-teal-600 font-semibold">₹{p.price}/{p.unit}</span>
          <button onClick={handleAdd}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              added ? 'bg-green-500 text-white' : 'bg-teal-500 text-white hover:bg-teal-600'
            }`}>
            {added ? '✓ Added' : '+ Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}

