import { useState } from 'react'
import '../styles/AuthModal.css'
import { api } from '../services/api'
import { trackLogin, trackSignUp } from '../utils/analytics'

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login', message = '' }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login')
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Basic client-side validation
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const credentials = {
        username: formData.username.trim(),
        password: formData.password
      }

      // Use the api service which uses the correct environment variable
      const data = isLogin
        ? await api.login(credentials)
        : await api.register(credentials)

      // Store token and user data
      localStorage.setItem('authToken', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))

      // Track analytics event
      if (isLogin) {
        trackLogin('email')
      } else {
        trackSignUp('email')
      }

      // Call success callback
      onAuthSuccess(data.data.user, data.data.token)

      // Reset form and close
      setFormData({
        username: '',
        password: ''
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setFormData({
      username: '',
      password: ''
    })
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>

        <h2>{isLogin ? 'Login' : 'Create an Account'}</h2>

        {message && (
          <div className="info-banner">
            <span className="info-icon">✨</span>
            <p>{message}</p>
          </div>
        )}

        {!isLogin && !message && (
          <div className="info-banner">
            <span className="info-icon">ℹ️</span>
            <p>Create an account to post items, manage your listings, and connect with buyers.</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
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
            ) : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <p className="switch-mode">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={switchMode} className="link-button">
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  )
}
