import { NavLink, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner container">
        <div className="navbar-logo" onClick={() => navigate('/dashboard')}>
          <span className="logo-text">WARDROBE</span>
        </div>

        <div className="navbar-links">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-home">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </NavLink>
          <NavLink to="/closet" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-closet">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16.01 2 7.99 4.46 3.62 3 2 4.5v15l3.62 1.46L9.99 19.5l8.02 2.46L21.62 20.5V5.5z"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
            My Closet
          </NavLink>
          <NavLink to="/outfits" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-outfits">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            Outfits
          </NavLink>
          <NavLink to="/style-profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-style">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            Style DNA
          </NavLink>
        </div>

        <div className="navbar-actions">
          <NavLink to="/add-item" className="btn btn-primary btn-sm" id="nav-add-item">
            <Plus size={16} strokeWidth={2.5} />
            Add Item
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `nav-avatar ${isActive ? 'active' : ''}`} id="nav-profile">
            <div className="avatar-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
