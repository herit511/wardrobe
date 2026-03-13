import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Auth.css'

function ForgotPassword() {
  const [step, setStep] = useState(1) // 1: email, 2: OTP, 3: reset
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [passwords, setPasswords] = useState({ password: '', confirm: '' })

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleNext = (e) => {
    e.preventDefault()
    if (step < 3) setStep(step + 1)
    else {
      // TODO: integrate reset password API
      window.location.href = '/login'
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
      <div className="auth-left auth-circles">
        <div className="circle-decoration">
          <div className="circle-lg" style={{ opacity: step === 1 ? 1 : 0.6 }}></div>
          <div className="circle-sm"></div>
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
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary auth-btn" id="continue-btn">
              Continue
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
