import { useAuth } from '../../context/AuthContext'
export default function TransportDashboard() {
  const { user, logout } = useAuth()
  return (
    <div className="p-8">
      <h1 className="text-2xl font-medium">Transport Dashboard</h1>
      <p className="text-gray-500 mt-1">Welcome, {user?.name}</p>
      <button onClick={logout} className="mt-4 text-sm text-red-500">Logout</button>
    </div>
  )
}