import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import useRefreshOnFocus from '../../hooks/useRefreshOnFocus'

const BACKEND = 'https://farm2home-ai.onrender.com'

export default function FarmerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="font-semibold text-green-700 text-lg">🌾 Farm 2 Home</span>
        <div className="flex gap-4 items-center">
          <Link to="/farmer/add" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">+ Add Product</Link>
          <Link to="/farmer/orders" className="text-gray-600 text-sm hover:text-gray-900">Orders</Link>
          <Link to="/farmer/about" className="text-gray-600 text-sm hover:text-gray-900">About</Link>
          <span className="text-gray-500 text-sm">{user?.name}</span>
          <button onClick={() => { logout(); navigate('/login') }} className="text-red-500 text-sm">Logout</button>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">My Listings</h1>
        <p className="text-gray-500 text-sm mb-6">Manage your farm products</p>
        <ProductList />
      </div>
    </div>
  )
}

function VideoUpload({ productId, hasVideo, onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState(null)

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('video', file)
      const res = await fetch(BACKEND + '/api/products/' + productId + '/video', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
        body: formData
      })
      const data = await res.json()
      if (res.ok) { alert('Video uploaded!'); onUploaded(); }
      else alert(data.message)
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
      setFile(null)
    }
  }

  return (
    <div className="w-full mt-1">
      {hasVideo
        ? <span className="text-xs text-green-600">✓ Video added</span>
        : <div className="flex gap-1 items-center">
            <input type="file" accept="video/*" onChange={e => setFile(e.target.files[0])}
              className="text-xs w-28" />
            {file && (
              <button onClick={handleUpload} disabled={uploading}
                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 disabled:opacity-50">
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            )}
          </div>
      }
    </div>
  )
}

function ProductList() {
  const [products, setProducts] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const navigate = useNavigate()

  const fetchProducts = React.useCallback(async () => {
    try {
      const res = await api.get('/api/products/my')
      setProducts(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useRefreshOnFocus(fetchProducts)
  React.useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await api.delete('/api/products/' + id)
      setProducts(products.filter(p => p._id !== id))
    } catch (err) { console.error(err) }
  }

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>
  if (!products.length) return (
    <div className="text-center py-16">
      <p className="text-gray-400 text-lg mb-4">No products yet</p>
      <button onClick={() => navigate('/farmer/add')} className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm">Add your first product</button>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {products.map(p => (
        <div key={p._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {p.images?.[0]
            ? <img src={p.images[0]} alt={p.title} className="w-full h-44 object-cover cursor-pointer" onClick={() => window.open(p.images[0], '_blank')}/>
            : <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">No image</div>
          }
          <div className="p-4">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-medium text-gray-900">{p.title}</h3>
              <span className={'text-xs px-2 py-0.5 rounded-full ' + (p.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                {p.available ? 'Available' : 'Sold out'}
              </span>
            </div>
            <p className="text-green-600 font-semibold text-sm mb-1">₹{p.price} / {p.unit}</p>
            <p className="text-gray-500 text-xs mb-3">Qty: {p.quantity} · {p.category}</p>
            <div className="flex gap-2">
              <button onClick={() => navigate('/farmer/edit/' + p._id)}
                className="flex-1 border border-gray-200 text-gray-600 text-xs py-1.5 rounded-lg hover:bg-gray-50">
                Edit
              </button>
              <button onClick={() => handleDelete(p._id)}
                className="flex-1 border border-red-200 text-red-500 text-xs py-1.5 rounded-lg hover:bg-red-50">
                Delete
              </button>
            </div>
            <VideoUpload productId={p._id} hasVideo={!!p.video} onUploaded={fetchProducts} />
          </div>
        </div>
      ))}
    </div>
  )
}
