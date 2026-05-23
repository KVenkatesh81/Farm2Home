import { useState } from 'react'
import api from '../../utils/api'

export default function LicenceUpload() {
  const [file, setFile] = useState(null)
  const [licenceNumber, setLicenceNumber] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return setError('Please select a licence image')
    if (!email) return setError('Please enter your registered email')
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('licence', file)
      formData.append('licenceNumber', licenceNumber)
      formData.append('email', email)
      await api.post('/api/transport/upload-licence', formData)
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 p-10 max-w-md text-center">
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Licence submitted!</h2>
          <p className="text-gray-500 text-sm mb-4">Your licence is under review. You'll get access once verified.</p>
          <div className="bg-amber-50 rounded-lg p-4 text-sm text-amber-700">
            Licence Number: <span className="font-medium">{licenceNumber}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-md">
        <div className="text-4xl mb-4">🪪</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Upload your licence</h1>
        <p className="text-gray-500 text-sm mb-6">You need a verified licence to access the transport dashboard.</p>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Registered email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email you used to register"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-amber-500"/>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Licence number</label>
            <input
              value={licenceNumber}
              onChange={e => setLicenceNumber(e.target.value)}
              placeholder="e.g. DL-1234567890"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-amber-500"/>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Licence image (jpg/png)</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setFile(e.target.files[0])}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm"/>
          </div>
          <button type="submit" disabled={loading}
            className="bg-amber-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50">
            {loading ? 'Uploading...' : 'Submit licence'}
          </button>
        </form>
      </div>
    </div>
  )
}