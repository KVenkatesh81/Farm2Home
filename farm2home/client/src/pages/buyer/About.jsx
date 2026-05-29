import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function BuyerAbout() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="font-semibold text-teal-600 text-lg">🛒 Farm2Home</span>
        <Link to="/buyer" className="text-gray-500 text-sm">← Back</Link>
      </nav>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-2xl mb-4">🛒</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">{user?.name}</h1>
          <p className="text-teal-600 text-sm mb-6">Buyer · Farm 2 Home</p>
          <div className="flex flex-col gap-3 text-sm text-gray-600">
            <p>Farm 2 Home connects you directly with local farmers — no middlemen, no cold storage delays. Everything you order is fresh from the farm.</p>
            <p>Browse hundreds of farm products, filter by category and price, and get it delivered to your door with cash on delivery.</p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              ['Fresh produce', 'Direct from farms'],
              ['No middlemen', 'Better prices'],
              ['Cash on delivery', 'Pay on arrival']
            ].map(([t, s]) => (
              <div key={t} className="bg-teal-50 rounded-lg p-4">
                <p className="font-medium text-teal-700 text-sm">{t}</p>
                <p className="text-xs text-gray-500 mt-1">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}