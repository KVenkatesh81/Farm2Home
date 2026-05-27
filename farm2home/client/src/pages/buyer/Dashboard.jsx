import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import api from '../../utils/api'
import useRefreshOnFocus from '../../hooks/useRefreshOnFocus'

const BACKEND = 'https://farm2home-ai.onrender.com'

export default function BuyerDashboard() {
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [maxPrice, setMaxPrice] = useState(1000)
  const [searchMode, setSearchMode] = useState('normal')
  const [timer, setTimer] = useState(null)

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/api/products')
      setProducts(res.data)
      setFiltered(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useRefreshOnFocus(fetchProducts)
  useEffect(() => { fetchProducts() }, [fetchProducts])

  useEffect(() => {
    if (!search) { filterProducts(); setSearchMode('normal'); return }
    if (timer) clearTimeout(timer)
    const t = setTimeout(() => handleAISearch(search), 1000)
    setTimer(t)
  }, [search])

  useEffect(() => { if (!search) filterProducts() }, [category, maxPrice, products])

  const filterProducts = () => {
    let result = [...products]
    if (category) result = result.filter(p => p.category === category)
    result = result.filter(p => p.price <= maxPrice)
    setFiltered(result)
  }

  const handleAISearch = async (query) => {
    if (!query.trim()) return
    setSearchLoading(true)
    try {
      const response = await fetch(
        BACKEND + '/api/products/search?q=' + encodeURIComponent(query),
        { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }
      )
      const data = await response.json()
      if (Array.isArray(data) && data.length > 0) {
        setFiltered(data)
        setSearchMode('ai')
      } else {
        const basic = products.filter(p =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
        )
        setFiltered(basic)
        setSearchMode('basic')
      }
    } catch (err) {
      const basic = products.filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
      setFiltered(basic)
      setSearchMode('basic')
    } finally { setSearchLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="font-semibold text-teal-600 text-lg">🛒 Farm 2 Home</span>
        <div className="flex gap-4 items-center">
          <Link to="/buyer/cart" className="relative text-gray-600 text-sm hover:text-gray-900">
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-teal-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
            )}
          </Link>
          <Link to="/buyer/orders" className="text-gray-600 text-sm">Orders</Link>
          <Link to="/buyer/about" className="text-gray-600 text-sm">About</Link>
          <span className="text-gray-500 text-sm">{user?.name}</span>
          <button onClick={() => { logout(); navigate('/login') }} className="text-red-500 text-sm">Logout</button>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Fresh from the farm</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-48">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="AI search — try protein food or sweet fruit"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-500 pr-28"/>
            <div className={'absolute right-3 top-2.5 text-xs px-2 py-0.5 rounded-full ' + (searchMode === 'ai' ? 'bg-purple-100 text-purple-700' : searchMode === 'basic' ? 'bg-gray-100 text-gray-500' : 'bg-teal-50 text-teal-600')}>
              {searchLoading ? 'searching...' : searchMode === 'ai' ? '✦ AI results' : searchMode === 'basic' ? 'basic search' : '✦ AI search'}
            </div>
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-500">
            <option value="">All categories</option>
            {['vegetables','fruits','grains','dairy','spices','poultry','fishery','other'].map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Max:</span>
            <input type="range" min="10" max="1000" value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))} className="w-24 accent-teal-500"/>
            <span className="text-sm font-medium text-teal-600">₹{maxPrice}</span>
          </div>
          {(search || category) && (
            <button onClick={() => { setSearch(''); setCategory(''); setMaxPrice(1000); setSearchMode('normal'); fetchProducts() }}
              className="text-sm text-red-400 hover:text-red-600">Clear</button>
          )}
        </div>
        {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {filtered.length} products
              {searchMode === 'ai' && search && <span className="ml-2 text-purple-600 font-medium">✦ AI matched "{search}"</span>}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg mb-2">No products found</p>
                <button onClick={() => { setSearch(''); setCategory(''); setMaxPrice(1000); setSearchMode('normal'); fetchProducts() }}
                  className="text-teal-600 text-sm">Show all products</button>
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
  const [similar, setSimilar] = useState([])
  const [showSimilar, setShowSimilar] = useState(false)

  const handleAdd = () => {
    addToCart(p)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleSimilar = async () => {
    if (similar.length > 0) { setShowSimilar(!showSimilar); return }
    try {
      const res = await api.get('/api/products/similar/' + p._id)
      setSimilar(res.data)
      setShowSimilar(true)
    } catch (err) { console.error(err) }
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
        <p className="text-xs text-gray-400 mb-1">by {p.farmerName}{p.farmerLocation && <span className="ml-1">· 📍 {p.farmerLocation}</span>}</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-teal-600 font-semibold">₹{p.price}/{p.unit}</span>
          <button onClick={handleAdd}
            className={'px-3 py-1.5 rounded-lg text-xs font-medium transition-all ' + (added ? 'bg-green-500 text-white' : 'bg-teal-500 text-white hover:bg-teal-600')}>
            {added ? '✓ Added' : '+ Cart'}
          </button>
        </div>
        <button onClick={handleSimilar} className="text-xs text-purple-500 hover:text-purple-700 w-full text-left">
          {showSimilar ? '▲ Hide similar' : '✦ Show similar products'}
        </button>
        {showSimilar && similar.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Similar products</p>
            <div className="flex flex-col gap-2">
              {similar.map(s => (
                <div key={s._id} className="flex gap-2 items-center">
                  {s.images?.[0]
                    ? <img src={s.images[0]} className="w-8 h-8 rounded object-cover"/>
                    : <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs">🌾</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 truncate">{s.title}</p>
                    <p className="text-xs text-teal-600">₹{s.price}/{s.unit}</p>
                  </div>
                  <button onClick={() => addToCart(s)} className="text-xs bg-teal-50 text-teal-600 px-2 py-1 rounded hover:bg-teal-100">Add</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
