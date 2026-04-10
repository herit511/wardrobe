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
            <img 
              src="/logo.png"
              alt="Wardrobe illustration"
              className="auth-logo-img"
            />
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

            <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              By creating an account, you agree to our <Link to="/terms" style={{ color: 'var(--color-text-secondary)', textDecoration: 'underline' }}>Terms</Link> and <Link to="/privacy" style={{ color: 'var(--color-text-secondary)', textDecoration: 'underline' }}>Privacy Policy</Link>.
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup
