import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const BACKEND = 'https://farm2home-ai.onrender.com'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', role: 'buyer' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(BACKEND + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.needsLicence) { navigate('/transport/licence'); return }
        if (data.pendingVerification) { setError('Your licence is under review. Please wait for verification.'); return }
        throw new Error(data.message || 'Login failed')
      }

      login(data.user, data.token)
      navigate('/' + data.user.role)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl border border-gray-200 w-full max-w-md">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">Farm2Home</h1>
        <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>

        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2">
            {['buyer','farmer','transport'].map(r => (
              <button type="button" key={r}
                onClick={() => setForm({...form, role: r})}
                className={'flex-1 py-2 text-sm rounded-lg border capitalize transition-all ' + (
                  form.role === r ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                )}>
                {r}
              </button>
            ))}
          </div>
          <input type="email" placeholder="Email" required
            value={form.email} onChange={e => setForm({...form, email: e.target.value})}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"/>
          <input type="password" placeholder="Password" required
            value={form.password} onChange={e => setForm({...form, password: e.target.value})}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"/>
          <button type="submit" disabled={loading}
            className="bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          No account? <Link to="/register" className="text-green-600">Register</Link>
        </p>
      </div>
    </div>
  )
}
