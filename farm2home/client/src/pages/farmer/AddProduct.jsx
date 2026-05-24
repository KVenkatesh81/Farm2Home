import api from '../../utils/api'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AddProduct() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', price: '', quantity: '', unit: 'kg', category: 'vegetables'
  })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

 const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError('')
  try {
    const formData = new FormData()
    Object.entries(form).forEach(([k, v]) => formData.append(k, v))
    images.forEach(img => formData.append('images', img))

    const response = await fetch(
      'https://bug-free-yodel-4j94ww6v69q7c56-5000.app.github.dev/api/products',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
        mode: 'cors',
        credentials: 'omit'
      }
    )

    const data = await response.json()
    if (data._id) {
      navigate('/farmer')
    } else {
      setError(data.message || 'Failed to add product')
    }
  } catch (err) {
    console.error('ERROR:', err)
    setError('Failed — ' + err.message)
  } finally {
    setLoading(false)
  }
}
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="font-semibold text-green-700 text-lg">🌾 Farm 2 Home</span>
        <Link to="/farmer" className="text-gray-500 text-sm hover:text-gray-900">← Back to listings</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Add new product</h1>

        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Product name *</label>
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              placeholder="e.g. Fresh Tomatoes"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"/>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Description *</label>
            <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Describe your product — freshness, how it's grown, etc."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 resize-none"/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Price (₹) *</label>
              <input required type="number" min="1" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                placeholder="e.g. 40"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"/>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Quantity *</label>
              <input required type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})}
                placeholder="e.g. 100"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Unit *</label>
              <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500">
                {['kg','gram','dozen','piece','litre','bundle'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Category *</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500">
                {['vegetables','fruits','grains','dairy','spices','poultry','fishery','other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Product images (max 4)</label>
            <input type="file" accept="image/*" multiple onChange={handleImageChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm"/>
            {previews.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {previews.map((src, i) => (
                  <img key={i} src={src} className="w-20 h-20 object-cover rounded-lg border border-gray-200"/>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 mt-2">
            {loading ? 'Uploading...' : 'Add product'}
          </button>
        </form>
      </div>
    </div>
  )
}