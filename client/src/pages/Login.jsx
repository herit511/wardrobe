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
