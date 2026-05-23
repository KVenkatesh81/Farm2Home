import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'buyer', licenceNumber:'' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await axios.post('/api/auth/register', form)
      setSuccess('Registered! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl border border-gray-200 w-full max-w-md">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">Create account</h1>
        <p className="text-gray-500 text-sm mb-6">Join Farm 2 Home</p>

        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2">
            {['buyer','farmer','transport'].map(r => (
              <button type="button" key={r}
                onClick={() => setForm({...form, role: r})}
                className={`flex-1 py-2 text-sm rounded-lg border capitalize transition-all ${
                  form.role === r
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                {r}
              </button>
            ))}
          </div>

          <input type="text" placeholder="Full name" required
            value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"/>
          <input type="email" placeholder="Email" required
            value={form.email} onChange={e => setForm({...form, email: e.target.value})}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"/>
          <input type="password" placeholder="Password" required
            value={form.password} onChange={e => setForm({...form, password: e.target.value})}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"/>

          {form.role === 'transport' && (
            <input type="text" placeholder="Licence number"
              value={form.licenceNumber} onChange={e => setForm({...form, licenceNumber: e.target.value})}
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"/>
          )}

          <button type="submit" disabled={loading}
            className="bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Have an account? <Link to="/login" className="text-green-600">Sign in</Link>
        </p>
      </div>
    </div>
  )
}