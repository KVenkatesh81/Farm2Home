import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import FarmerDashboard from './pages/farmer/Dashboard'
import AddProduct from './pages/farmer/AddProduct'
import EditProduct from './pages/farmer/EditProduct'
import FarmerAbout from './pages/farmer/About'
import TransportDashboard from './pages/transport/Dashboard'
import BuyerDashboard from './pages/buyer/Dashboard'

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (user.role !== role) return <Navigate to="/login" />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Farmer routes */}
      <Route path="/farmer" element={<ProtectedRoute role="farmer"><FarmerDashboard /></ProtectedRoute>}/>
      <Route path="/farmer/add" element={<ProtectedRoute role="farmer"><AddProduct /></ProtectedRoute>}/>
      <Route path="/farmer/edit/:id" element={<ProtectedRoute role="farmer"><EditProduct /></ProtectedRoute>}/>
      <Route path="/farmer/about" element={<ProtectedRoute role="farmer"><FarmerAbout /></ProtectedRoute>}/>

      {/* Transport routes */}
      <Route path="/transport" element={<ProtectedRoute role="transport"><TransportDashboard /></ProtectedRoute>}/>

      {/* Buyer routes */}
      <Route path="/buyer" element={<ProtectedRoute role="buyer"><BuyerDashboard /></ProtectedRoute>}/>
    </Routes>
  )
}