import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Closet from './pages/Closet'
import Outfits from './pages/Outfits'
import Suggestions from './pages/Suggestions'
import AddItem from './pages/AddItem'
import EditItem from './pages/EditItem'
import StyleProfile from './pages/StyleProfile'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <div className="app">
      <Routes>
        {/* Auth Routes (no navbar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* App Routes (with navbar) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<><Navbar /><Dashboard /></>} />
          <Route path="/closet" element={<><Navbar /><Closet /></>} />
          <Route path="/outfits" element={<><Navbar /><Outfits /></>} />
          <Route path="/suggestions" element={<><Navbar /><Suggestions /></>} />
          <Route path="/add-item" element={<><Navbar /><AddItem /></>} />
          <Route path="/edit-item/:id" element={<><Navbar /><EditItem /></>} />
          <Route path="/style-profile" element={<><Navbar /><StyleProfile /></>} />
          <Route path="/profile" element={<><Navbar /><Profile /></>} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

export default App
