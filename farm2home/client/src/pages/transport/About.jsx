import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function TransportAbout() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="font-semibold text-amber-600 text-lg">🚚 Farm2Home</span>
        <Link to="/transport" className="text-gray-500 text-sm">← Dashboard</Link>
      </nav>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-2xl mb-4">🚚</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">{user?.name}</h1>
          <p className="text-amber-600 text-sm mb-2">Transport Partner · Farm 2 Home</p>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-6 ${
            user?.licenceVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {user?.licenceVerified ? '✓ Licence Verified' : '⏳ Licence Pending'}
          </div>
          <div className="flex flex-col gap-3 text-sm text-gray-600">
            <p>As a transport partner on Farm 2 Home, you connect farmers to buyers by delivering fresh produce directly from farms to markets and homes.</p>
            <p>Browse available trips, see the earnings upfront, and accept trips that work for your schedule and vehicle capacity.</p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[['Upfront pay', 'See earnings before accepting'], ['Flexible', 'Pick trips that suit you'], ['Impactful', 'Support local farmers']].map(([t, s]) => (
              <div key={t} className="bg-amber-50 rounded-lg p-4">
                <p className="font-medium text-amber-700 text-sm">{t}</p>
                <p className="text-xs text-gray-500 mt-1">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}