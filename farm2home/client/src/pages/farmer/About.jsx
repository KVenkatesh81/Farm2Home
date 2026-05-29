import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function FarmerAbout() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="font-semibold text-green-700 text-lg">🌾 Farm2Home</span>
        <Link to="/farmer" className="text-gray-500 text-sm">← Dashboard</Link>
      </nav>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl mb-4">🧑‍🌾</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">{user?.name}</h1>
          <p className="text-green-600 text-sm mb-6">Verified Farmer · Farm 2 Home</p>
          <div className="flex flex-col gap-4 text-sm text-gray-600">
            <p>Welcome to Farm 2 Home — a platform that connects farmers directly with buyers, cutting out the middleman so you earn more and buyers get fresher produce.</p>
            <p>As a farmer on this platform, you can list your products, set your own prices, and reach buyers directly in your region.</p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[['Direct sales', 'No middlemen'], ['Fair pricing', 'You set the price'], ['Fresh delivery', 'Farm to doorstep']].map(([t, s]) => (
              <div key={t} className="bg-green-50 rounded-lg p-4">
                <p className="font-medium text-green-700 text-sm">{t}</p>
                <p className="text-xs text-gray-500 mt-1">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}