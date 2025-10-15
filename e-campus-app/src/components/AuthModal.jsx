import { useState } from 'react'
import '../styles/AuthModal.css'

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
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
    setLoading(true)

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register'
      const body = {
        username: formData.username,
        password: formData.password
      }

      const response = await fetch(`http://localhost:5000/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('authToken', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))

        // Call success callback
        onAuthSuccess(data.data.user, data.data.token)

        // Reset form and close
        setFormData({
          username: '',
          password: ''
        })
        onClose()
      } else {
        setError(data.message || 'Authentication failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
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

        {!isLogin && (
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
