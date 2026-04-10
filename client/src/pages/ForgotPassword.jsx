import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import './Auth.css'

function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: email, 2: OTP, 3: reset
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [passwords, setPasswords] = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleNext = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (step === 1) {
        // Send OTP
        const res = await api.post('/auth/forgot-password', { email })
        if (!res.success) throw new Error(res.message)
        alert('If this email is registered, a 4-digit code will be sent to you (Logging to server console for MVP setup).')
        setStep(2)
      } else if (step === 2) {
        // Just move to step 3, OTP is verified on final submit
        if (otp.join('').length !== 4) throw new Error('Please enter complete 4-digit code')
        setStep(3)
      } else if (step === 3) {
        // Submit entirely
        if (passwords.password !== passwords.confirm) throw new Error('Passwords do not match')
        const finalOtp = otp.join('')
        const res = await api.put('/auth/reset-password', { email, otp: finalOtp, newPassword: passwords.password })
        if (!res.success) throw new Error(res.message)
        
        alert('Password reset successful! Please login with your new password.')
        navigate('/login')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const stepTitles = ['Forgot Password', 'Enter 4-Digit Code', 'Reset Password']
  const stepDescriptions = [
    'Enter your email and we\'ll send you a 4-digit code to reset your password.',
    'Enter the 4-digit code that you received on your email.',
    'Set the new password for your account so you can login and access all the features.'
  ]

  return (
    <div className="auth-page" id="forgot-password-page">
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
          <div className="steps-indicator" id="step-indicator">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`step-dot ${step === s ? 'active' : ''}`}></div>
            ))}
          </div>

          <h1 className="auth-title heading-italic">{stepTitles[step - 1]}</h1>
          <p className="auth-subtitle" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            {stepDescriptions[step - 1]}
          </p>

          {error && <div className="auth-error" style={{ color: '#E74C3C', padding: '10px 0', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

          <form className="auth-form" onSubmit={handleNext}>
            {step === 1 && (
              <div className="form-group">
                <label htmlFor="reset-email">Email</label>
                <input
                  type="email"
                  id="reset-email"
                  className="input-field"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}

            {step === 2 && (
              <div className="otp-group" id="otp-inputs">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    type="text"
                    id={`otp-${i}`}
                    className="otp-input"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    required
                  />
                ))}
              </div>
            )}

            {step === 3 && (
              <>
                <div className="form-group">
                  <label htmlFor="new-password">New Password</label>
                  <input
                    type="password"
                    id="new-password"
                    className="input-field"
                    placeholder="Enter new password"
                    value={passwords.password}
                    onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirm-new-password">Confirm Password</label>
                  <input
                    type="password"
                    id="confirm-new-password"
                    className="input-field"
                    placeholder="Confirm new password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary auth-btn" id="continue-btn" disabled={loading}>
              {loading ? 'Processing...' : step === 3 ? 'Reset Password' : 'Continue'}
            </button>

            <p className="auth-toggle">
              <Link to="/login">Back to Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
