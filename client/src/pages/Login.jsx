import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await login(form.email, form.password)
    setLoading(false)
    if (res.success) {
      navigate('/dashboard')
    } else {
      setError(res.error || 'Failed to sign in')
    }
  }

  return (
    <div className="auth-page" id="login-page">
      <div className="auth-left">
        <div className="auth-illustration">
          <div className="wardrobe-sketch">
            <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="80" y="60" width="240" height="300" rx="12" stroke="#1B2A4A" strokeWidth="2" fill="none"/>
              <line x1="200" y1="60" x2="200" y2="360" stroke="#1B2A4A" strokeWidth="1.5" strokeDasharray="4 4"/>
              <line x1="100" y1="120" x2="180" y2="120" stroke="#D4A030" strokeWidth="2"/>
              <line x1="220" y1="120" x2="300" y2="120" stroke="#D4A030" strokeWidth="2"/>
              {/* Hangers */}
              <path d="M120 120 L130 140 L140 120" stroke="#E87040" strokeWidth="1.5" fill="none"/>
              <path d="M145 120 L155 145 L165 120" stroke="#1B2A4A" strokeWidth="1.5" fill="none"/>
              <rect x="125" y="140" width="20" height="35" rx="3" fill="#F5E6D3" stroke="#D4A030" strokeWidth="1"/>
              <rect x="150" y="145" width="18" height="40" rx="3" fill="#E8DDD0" stroke="#1B2A4A" strokeWidth="1"/>
              <path d="M240 120 L250 138 L260 120" stroke="#E87040" strokeWidth="1.5" fill="none"/>
              <path d="M265 120 L275 142 L285 120" stroke="#D4A030" strokeWidth="1.5" fill="none"/>
              <rect x="245" y="138" width="18" height="38" rx="3" fill="#FFF5EC" stroke="#E87040" strokeWidth="1"/>
              <rect x="270" y="142" width="16" height="30" rx="3" fill="#F5E6D3" stroke="#D4A030" strokeWidth="1"/>
              {/* Shoes */}
              <ellipse cx="130" cy="330" rx="22" ry="10" fill="#E8DDD0" stroke="#1B2A4A" strokeWidth="1"/>
              <ellipse cx="170" cy="332" rx="20" ry="9" fill="#F5E6D3" stroke="#D4A030" strokeWidth="1"/>
              <ellipse cx="260" cy="330" rx="22" ry="10" fill="#FFF5EC" stroke="#E87040" strokeWidth="1"/>
              {/* Shelves */}
              <line x1="95" y1="200" x2="185" y2="200" stroke="#1B2A4A" strokeWidth="1.5"/>
              <line x1="215" y1="200" x2="305" y2="200" stroke="#1B2A4A" strokeWidth="1.5"/>
              <rect x="100" y="205" width="30" height="20" rx="4" fill="#E87040" opacity="0.3"/>
              <rect x="135" y="208" width="25" height="17" rx="4" fill="#D4A030" opacity="0.3"/>
              <rect x="230" y="205" width="28" height="18" rx="4" fill="#1B2A4A" opacity="0.15"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrapper">
          <h1 className="auth-title heading-italic">Welcome to <span className="text-navy">WARDROBE</span></h1>
          <p className="auth-subtitle">Your Digital Closet</p>

          <form className="auth-form" onSubmit={handleSubmit} id="login-form">
            {error && <div className="error-message" style={{ color: '#E87040', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                type="email"
                id="login-email"
                className="input-field"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                className="input-field"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <Link to="/forgot-password" className="forgot-link" id="forgot-password-link">Forgot password?</Link>

            <button type="submit" className="btn btn-primary auth-btn" id="login-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <p className="auth-toggle">
              New here? <Link to="/signup" id="signup-link">Create an account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
