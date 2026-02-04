import { useState, useEffect } from 'react'
import '../styles/AuthModal.css'
import { api } from '../services/api'
import { trackLogin, trackSignUp } from '../utils/analytics'

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login', message = '', resetToken = null }) {
  // View states: 'login', 'register', 'forgot', 'reset-sent', 'reset-password'
  const [view, setView] = useState(initialMode === 'register' ? 'register' : 'login')
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Handle reset token from URL
  useEffect(() => {
    if (resetToken) {
      setView('reset-password')
    }
  }, [resetToken])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError('')
      setSuccessMessage('')
      if (!resetToken) {
        setView(initialMode === 'register' ? 'register' : 'login')
      }
    }
  }, [isOpen, initialMode, resetToken])

  if (!isOpen) return null

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    if (view === 'register' && (!formData.email || !formData.email.includes('@'))) {
      setError('Please enter a valid email address')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const credentials = view === 'login'
        ? {
            username: formData.username.trim(),
            password: formData.password
          }
        : {
            username: formData.username.trim(),
            email: formData.email.trim(),
            password: formData.password
          }

      const data = view === 'login'
        ? await api.login(credentials)
        : await api.register(credentials)

      localStorage.setItem('authToken', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))

      if (view === 'login') {
        trackLogin('email')
      } else {
        trackSignUp('email')
      }

      onAuthSuccess(data.data.user, data.data.token)
      resetForm()
      onClose()
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      await api.forgotPassword(formData.email.trim())
      setView('reset-sent')
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const data = await api.resetPassword(resetToken, formData.password)

      // Auto-login after password reset
      localStorage.setItem('authToken', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))

      onAuthSuccess(data.data.user, data.data.token)

      // Clear the reset token from URL
      window.history.replaceState({}, '', window.location.pathname)

      resetForm()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      email: ''
    })
    setError('')
    setSuccessMessage('')
  }

  const switchToLogin = () => {
    resetForm()
    setView('login')
  }

  const switchToRegister = () => {
    resetForm()
    setView('register')
  }

  const switchToForgot = () => {
    resetForm()
    setView('forgot')
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>

        {/* Login View */}
        {view === 'login' && (
          <>
            <h2>Login</h2>

            {message && (
              <div className="info-banner">
                <span className="info-icon">&#10024;</span>
                <p>{message}</p>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={30}
                  placeholder="Enter your username"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Enter your password"
                />
              </div>

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? (
                  <span className="loading-content">
                    <span className="spinner"></span>
                    Please wait...
                  </span>
                ) : 'Login'}
              </button>
            </form>

            <p className="forgot-password">
              <button type="button" onClick={switchToForgot} className="link-button">
                Forgot Password?
              </button>
            </p>

            <p className="switch-mode">
              Don't have an account?{' '}
              <button type="button" onClick={switchToRegister} className="link-button">
                Register
              </button>
            </p>
          </>
        )}

        {/* Register View */}
        {view === 'register' && (
          <>
            <h2>Create an Account</h2>

            <div className="info-banner">
              <span className="info-icon">&#8505;&#65039;</span>
              <p>Create an account to post items, manage your listings, and connect with buyers.</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={30}
                  placeholder="Choose a username"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                />
                <small className="field-hint">Used for password recovery</small>
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Choose a password"
                />
              </div>

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? (
                  <span className="loading-content">
                    <span className="spinner"></span>
                    Please wait...
                  </span>
                ) : 'Register'}
              </button>
            </form>

            <p className="switch-mode">
              Already have an account?{' '}
              <button type="button" onClick={switchToLogin} className="link-button">
                Login
              </button>
            </p>
          </>
        )}

        {/* Forgot Password View */}
        {view === 'forgot' && (
          <>
            <h2>Reset Password</h2>

            <div className="info-banner">
              <span className="info-icon">&#128274;</span>
              <p>Enter the email address associated with your account and we'll send you a link to reset your password.</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? (
                  <span className="loading-content">
                    <span className="spinner"></span>
                    Sending...
                  </span>
                ) : 'Send Reset Link'}
              </button>
            </form>

            <p className="switch-mode">
              Remember your password?{' '}
              <button type="button" onClick={switchToLogin} className="link-button">
                Back to Login
              </button>
            </p>
          </>
        )}

        {/* Reset Email Sent View */}
        {view === 'reset-sent' && (
          <div className="success-view">
            <div className="success-icon">&#9993;&#65039;</div>
            <h2>Check Your Email</h2>
            <p className="success-message">
              If an account exists with <strong>{formData.email}</strong>, you'll receive a password reset link shortly.
            </p>
            <p className="success-note">
              The link expires in 10 minutes. Check your spam folder if you don't see it.
            </p>
            <button
              type="button"
              onClick={switchToLogin}
              className="submit-button"
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Reset Password View (with token) */}
        {view === 'reset-password' && (
          <>
            <h2>Set New Password</h2>

            <div className="info-banner">
              <span className="info-icon">&#128273;</span>
              <p>Enter your new password below.</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Enter new password"
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Confirm new password"
                />
              </div>

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? (
                  <span className="loading-content">
                    <span className="spinner"></span>
                    Resetting...
                  </span>
                ) : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
