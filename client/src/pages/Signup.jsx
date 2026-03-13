import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

function Signup() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setError('')
    setLoading(true)
    const res = await register(form.name, form.email, form.password)
    setLoading(false)
    if (res.success) {
      navigate('/style-profile')
    } else {
      setError(res.error || 'Failed to sign up')
    }
  }

  return (
    <div className="auth-page" id="signup-page">
      <div className="auth-left">
        <div className="auth-illustration">
          <div className="wardrobe-sketch">
            <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Open wardrobe rack */}
              <line x1="60" y1="80" x2="340" y2="80" stroke="#1B2A4A" strokeWidth="2"/>
              <line x1="60" y1="80" x2="60" y2="350" stroke="#1B2A4A" strokeWidth="2"/>
              <line x1="340" y1="80" x2="340" y2="350" stroke="#1B2A4A" strokeWidth="2"/>
              {/* Shelves */}
              <line x1="60" y1="220" x2="340" y2="220" stroke="#1B2A4A" strokeWidth="1.5"/>
              <line x1="60" y1="290" x2="340" y2="290" stroke="#1B2A4A" strokeWidth="1.5"/>
              {/* Hanging clothes */}
              <path d="M100 80 L110 100 L120 80" stroke="#E87040" strokeWidth="1.5" fill="none"/>
              <rect x="103" y="100" width="14" height="45" rx="3" fill="#FFF5EC" stroke="#E87040" strokeWidth="1"/>
              <path d="M150 80 L160 95 L170 80" stroke="#D4A030" strokeWidth="1.5" fill="none"/>
              <rect x="153" y="95" width="14" height="50" rx="3" fill="#F5E6D3" stroke="#D4A030" strokeWidth="1"/>
              <path d="M200 80 L210 98 L220 80" stroke="#1B2A4A" strokeWidth="1.5" fill="none"/>
              <rect x="203" y="98" width="14" height="42" rx="3" fill="#E8DDD0" stroke="#1B2A4A" strokeWidth="1"/>
              <path d="M250 80 L260 96 L270 80" stroke="#E87040" strokeWidth="1.5" fill="none"/>
              <rect x="253" y="96" width="14" height="48" rx="3" fill="#FFF5EC" stroke="#E87040" strokeWidth="1"/>
              <path d="M295 80 L305 93 L315 80" stroke="#D4A030" strokeWidth="1.5" fill="none"/>
              <rect x="298" y="93" width="14" height="40" rx="3" fill="#F5E6D3" stroke="#1B2A4A" strokeWidth="1"/>
              {/* Shelf items */}
              <rect x="80" y="228" width="45" height="25" rx="5" fill="#E87040" opacity="0.2" stroke="#E87040" strokeWidth="1"/>
              <rect x="140" y="225" width="35" height="28" rx="5" fill="#D4A030" opacity="0.2" stroke="#D4A030" strokeWidth="1"/>
              <rect x="240" y="226" width="40" height="26" rx="5" fill="#1B2A4A" opacity="0.1" stroke="#1B2A4A" strokeWidth="1"/>
              {/* Shoes on bottom */}
              <ellipse cx="110" cy="320" rx="25" ry="10" fill="#F5E6D3" stroke="#D4A030" strokeWidth="1"/>
              <ellipse cx="180" cy="322" rx="22" ry="9" fill="#E8DDD0" stroke="#1B2A4A" strokeWidth="1"/>
              <ellipse cx="260" cy="320" rx="24" ry="10" fill="#FFF5EC" stroke="#E87040" strokeWidth="1"/>
              {/* Hat on top */}
              <ellipse cx="290" cy="70" rx="30" ry="8" fill="#F5E6D3" stroke="#D4A030" strokeWidth="1"/>
              <ellipse cx="290" cy="65" rx="18" ry="12" fill="#FFF5EC" stroke="#D4A030" strokeWidth="1"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrapper">
          <h1 className="auth-title heading-italic">Join <span className="text-navy">WARDROBE</span></h1>
          <p className="auth-subtitle">Build your digital closet</p>

          <form className="auth-form" onSubmit={handleSubmit} id="signup-form">
            {error && <div className="error-message" style={{ color: '#E87040', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            <div className="form-group">
              <label htmlFor="signup-name">Full Name</label>
              <input
                type="text"
                id="signup-name"
                className="input-field"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">Email</label>
              <input
                type="email"
                id="signup-email"
                className="input-field"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <input
                type="password"
                id="signup-password"
                className="input-field"
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-confirm">Confirm Password</label>
              <input
                type="password"
                id="signup-confirm"
                className="input-field"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary auth-btn" id="signup-submit" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign up'}
            </button>

            <p className="auth-toggle">
              Already have an account? <Link to="/login" id="login-link">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup
