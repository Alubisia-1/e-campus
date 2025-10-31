import { useState } from 'react'
import '../styles/AuthModal.css'
import { api } from '../services/api'

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login', message = '' }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login')
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone: '',
    whatsapp: '',
    campus: ''
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
    setLoading(true)

    try {
      const credentials = isLogin
        ? {
            username: formData.username,
            password: formData.password
          }
        : {
            username: formData.username,
            password: formData.password,
            phone: formData.phone,
            whatsapp: formData.whatsapp,
            campus: formData.campus
          }

      // Use the api service which uses the correct environment variable
      const data = isLogin
        ? await api.login(credentials)
        : await api.register(credentials)

      // Store token and user data
      localStorage.setItem('authToken', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))

      // Call success callback
      onAuthSuccess(data.data.user, data.data.token)

      // Reset form and close
      setFormData({
        username: '',
        password: '',
        phone: '',
        whatsapp: '',
        campus: ''
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
      password: '',
      phone: '',
      whatsapp: '',
      campus: ''
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

          {!isLogin && (
            <>
              <div className="form-group">
                <label>Phone Number (Required for buyers to contact you)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="e.g., +254712345678"
                />
              </div>

              <div className="form-group">
                <label>WhatsApp Number (Optional)</label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="e.g., +254712345678"
                />
              </div>

              <div className="form-group">
                <label>Campus (Optional)</label>
                <input
                  type="text"
                  name="campus"
                  value={formData.campus}
                  onChange={handleChange}
                  placeholder="e.g., Main Campus, Parklands"
                />
              </div>
            </>
          )}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
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
