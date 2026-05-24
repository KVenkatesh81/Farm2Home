import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import FarmerDashboard from './pages/farmer/Dashboard'
import AddProduct from './pages/farmer/AddProduct'
import EditProduct from './pages/farmer/EditProduct'
import FarmerAbout from './pages/farmer/About'
import TransportDashboard from './pages/transport/Dashboard'
import LicenceUpload from './pages/transport/LicenceUpload'
import TransportAbout from './pages/transport/About'
import BuyerDashboard from './pages/buyer/Dashboard'
import Cart from './pages/buyer/Cart'
import Checkout from './pages/buyer/Checkout'
import OrderSuccess from './pages/buyer/OrderSuccess'
import Orders from './pages/buyer/Orders'
import BuyerAbout from './pages/buyer/About'

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

      {/* Farmer */}
      <Route path="/farmer" element={<ProtectedRoute role="farmer"><FarmerDashboard /></ProtectedRoute>}/>
      <Route path="/farmer/add" element={<ProtectedRoute role="farmer"><AddProduct /></ProtectedRoute>}/>
      <Route path="/farmer/edit/:id" element={<ProtectedRoute role="farmer"><EditProduct /></ProtectedRoute>}/>
      <Route path="/farmer/about" element={<ProtectedRoute role="farmer"><FarmerAbout /></ProtectedRoute>}/>

      {/* Transport */}
      <Route path="/transport" element={<ProtectedRoute role="transport"><TransportDashboard /></ProtectedRoute>}/>
      <Route path="/transport/licence" element={<LicenceUpload />}/>
      <Route path="/transport/about" element={<ProtectedRoute role="transport"><TransportAbout /></ProtectedRoute>}/>

      {/* Buyer */}
      <Route path="/buyer" element={<ProtectedRoute role="buyer"><BuyerDashboard /></ProtectedRoute>}/>
      <Route path="/buyer/cart" element={<ProtectedRoute role="buyer"><Cart /></ProtectedRoute>}/>
      <Route path="/buyer/checkout" element={<ProtectedRoute role="buyer"><Checkout /></ProtectedRoute>}/>
      <Route path="/buyer/order-success/:id" element={<ProtectedRoute role="buyer"><OrderSuccess /></ProtectedRoute>}/>
      <Route path="/buyer/orders" element={<ProtectedRoute role="buyer"><Orders /></ProtectedRoute>}/>
      <Route path="/buyer/about" element={<ProtectedRoute role="buyer"><BuyerAbout /></ProtectedRoute>}/>
    </Routes>
  )
}