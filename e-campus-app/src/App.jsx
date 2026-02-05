import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ShoppingBag, Menu, X, Plus, Search, Book, Laptop, Sofa, Shirt, ChevronDown, ChevronLeft, ChevronRight, MessageCircle, Phone, Mail, Instagram, Upload, Trash2, LogOut, User, Tag, Shield, Zap, Users, Star, TrendingUp, Eye, WifiOff, RefreshCw, Loader2 } from 'lucide-react'
import { api } from './services/api'
import ContactReveal from './components/ContactReveal'
import LocalContactReveal from './components/LocalContactReveal'
import AuthModal from './components/AuthModal'
import Toast from './components/Toast'
import ConfirmModal from './components/ConfirmModal'
import AdManager from './components/AdManager'
import AdDisplay from './components/AdDisplay'
import SponsoredBadge from './components/SponsoredBadge'
import CampusList from './components/CampusList'
import { trackProductView, trackSearch, trackListingCreated, trackListingDeleted, trackCategoryView, trackLogin, trackSignUp } from './utils/analytics'

function App() {
  // State management
  const [activeTab, setActiveTab] = useState('marketplace')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isImageFullscreen, setIsImageFullscreen] = useState(false)
  const [imageZoomLevel, setImageZoomLevel] = useState(1)

  // API connection state
  const [apiConnected, setApiConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  // API data state
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Category filtering state
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Campus filtering state
  const [campuses, setCampuses] = useState([])
  const [selectedCampus, setSelectedCampus] = useState(null)
  const [campusesLoading, setCampusesLoading] = useState(true)

  // Debounce timer ref for search
  const searchTimeoutRef = useRef(null)

  // Device ID for ownership tracking
  const [deviceId, setDeviceId] = useState(null)

  // Authentication state
  const [user, setUser] = useState(null)
  const [authToken, setAuthToken] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login')
  const [authModalMessage, setAuthModalMessage] = useState('')
  const [resetToken, setResetToken] = useState(null)

  // Toast notification state
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
  }

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  })

  const showConfirmModal = (title, message, onConfirm) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm })
  }

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })
  }

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [logoTapCount, setLogoTapCount] = useState(0)
  const [tapTimer, setTapTimer] = useState(null)

  // Post item modal state
  const [showPostModal, setShowPostModal] = useState(false)
  const [postFormData, setPostFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'Good',
    images: [],
    location: { campus: '', building: '' },
    tags: [],
    contact: { phone: '', email: '' }
  })
  const [isSubmittingPost, setIsSubmittingPost] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState([])

  // Ad Management Configuration
  const AD_CONFIG = {
    // How often to show native ads (every X products)
    nativeAdFrequency: 8,
    // How often to show sidebar ads on mobile (every X products)
    sidebarAdFrequency: 12,
    // Starting position for first ad (to avoid showing ad immediately)
    firstAdPosition: 8,
    // Maximum ads to show (to prevent oversaturation)
    maxAdsPerPage: 4
  }

  // Generate or retrieve device ID and load auth on mount
  useEffect(() => {
    let storedDeviceId = localStorage.getItem('deviceId')

    if (!storedDeviceId) {
      // Generate unique device ID
      storedDeviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('deviceId', storedDeviceId)
    }

    setDeviceId(storedDeviceId)

    // Load auth token and user from localStorage
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setAuthToken(storedToken)
      setUser(parsedUser)
      // Set admin status based on user role
      if (parsedUser.role === 'admin') {
        setIsAdmin(true)
      }
    }

    // Check for password reset token in URL
    const urlParams = new URLSearchParams(window.location.search)
    const reset = urlParams.get('reset')
    if (reset) {
      setResetToken(reset)
      setShowAuthModal(true)
      // Clear the URL parameter without refreshing
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // Handle admin login
  const handleAdminLogin = async (e) => {
    e.preventDefault()

    try {
      // Authenticate with backend
      const response = await api.adminLogin(adminPassword)

      if (response.status === 'success' && response.data.token) {
        setIsAdmin(true)
        localStorage.setItem('adminToken', response.data.token)
        setShowAdminLogin(false)
        setAdminPassword('')
        showToast('Admin access granted!', 'success')
      } else {
        showToast('Admin authentication failed', 'error')
        setAdminPassword('')
      }
    } catch (error) {
      console.error('Admin login error:', error)
      showToast(error.message || 'Incorrect password! Access denied.', 'error')
      setAdminPassword('')
    }
  }

  // Handle admin logout (for separate admin password login)
  const handleAdminLogout = () => {
    setIsAdmin(false)
    localStorage.removeItem('adminToken')
    setActiveTab('marketplace')
    showToast('Admin logged out', 'success')
  }

  // Hidden admin access via logo taps (tap logo 7 times within 3 seconds)
  const handleLogoTap = () => {
    // Clear existing timer
    if (tapTimer) {
      clearTimeout(tapTimer)
    }

    const newCount = logoTapCount + 1

    // Reset counter after 3 seconds of no taps
    const newTimer = setTimeout(() => {
      setLogoTapCount(0)
    }, 3000)

    setTapTimer(newTimer)
    setLogoTapCount(newCount)

    // If 7 taps reached, open admin login (silently)
    if (newCount === 7) {
      setLogoTapCount(0)
      clearTimeout(newTimer)
      if (!isAdmin) {
        setShowAdminLogin(true)
      }
    }
  }

  // Authentication handler
  const handleAuthSuccess = (userData, token) => {
    setUser(userData)
    setAuthToken(token)
    // Set admin status based on user role
    if (userData.role === 'admin') {
      setIsAdmin(true)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setAuthToken(null)
    setIsAdmin(false)
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setActiveTab('marketplace')
    showToast('Logged out successfully', 'success')
  }

  // Secret admin access via keyboard shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const handleAdminShortcut = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault()
        if (!isAdmin) {
          setShowAdminLogin(true)
        }
      }
    }

    window.addEventListener('keydown', handleAdminShortcut)
    return () => window.removeEventListener('keydown', handleAdminShortcut)
  }, [isAdmin])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden'
      // Track product view
      trackProductView(selectedProduct)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedProduct])

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedProduct) return

      if (e.key === 'Escape') {
        if (isImageFullscreen) {
          setIsImageFullscreen(false)
          setImageZoomLevel(1)
        } else {
          setSelectedProduct(null)
          setCurrentImageIndex(0)
          setIsImageFullscreen(false)
          setImageZoomLevel(1)
        }
      } else if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
        setCurrentImageIndex(currentImageIndex - 1)
        setImageZoomLevel(1)
      } else if (e.key === 'ArrowRight' && currentImageIndex < selectedProduct.images.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1)
        setImageZoomLevel(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedProduct, currentImageIndex, isImageFullscreen])

  // Retry state for connection failures
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  // Test API connection and fetch data on mount
  useEffect(() => {
    const maxRetries = 3

    // Function to load data with retry logic
    const loadAppData = async (attempt = 1) => {
      const timeout = attempt === 1 ? 10000 : 15000 // Shorter timeout on first try

      try {
        // Load all data in parallel
        const [categoriesResponse, productsResponse, campusesResponse] = await Promise.all([
          api.getCategories({ timeout }),
          api.getProducts({ timeout }),
          api.getCampuses({ timeout })
        ])

        console.log('Data loaded successfully on attempt', attempt)

        setCategories(categoriesResponse.data || [])
        setCampuses(campusesResponse.data || [])
        setCampusesLoading(false)

        const apiProducts = productsResponse.data?.products || []
        setProducts(apiProducts)
        setApiConnected(true)
        setRetryCount(0)

        return true
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error.message)

        // If we have retries left, try again with exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // 1s, 2s, 4s (max 5s)
          console.log(`Retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          return loadAppData(attempt + 1)
        }

        throw error
      }
    }

    const initializeApp = async () => {
      // First, send a quick "wake-up" ping to the backend (fire and forget)
      // This helps warm up sleeping servers on free hosting tiers
      api.healthCheck().then(
        (response) => console.log('Backend health check:', response)
      ).catch(
        (err) => console.warn('Health check failed:', err.message)
      )

      try {
        await loadAppData()
      } catch (error) {
        console.error('Failed to connect to backend after retries:', error)
        setApiConnected(false)
        setCategories([])
        setProducts([])
        setCampuses([])
        setCampusesLoading(false)
      } finally {
        setLoading(false)
        setDataLoading(false)
      }
    }

    initializeApp()
  }, [])

  // Manual retry function for users
  const handleRetryConnection = async () => {
    setIsRetrying(true)
    setRetryCount(prev => prev + 1)
    setDataLoading(true)

    const maxRetries = 3

    const attemptLoad = async (attempt = 1) => {
      const timeout = attempt === 1 ? 10000 : 15000

      try {
        const [categoriesResponse, productsResponse, campusesResponse] = await Promise.all([
          api.getCategories({ timeout }),
          api.getProducts({ timeout }),
          api.getCampuses({ timeout })
        ])

        setCategories(categoriesResponse.data || [])
        setCampuses(campusesResponse.data || [])
        setCampusesLoading(false)

        const apiProducts = productsResponse.data?.products || []
        setProducts(apiProducts)
        setApiConnected(true)
        setRetryCount(0)

        return true
      } catch (error) {
        console.error(`Retry attempt ${attempt} failed:`, error.message)

        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
          console.log(`Retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          return attemptLoad(attempt + 1)
        }

        throw error
      }
    }

    try {
      await attemptLoad()
    } catch (error) {
      console.error('Manual retry failed after all attempts:', error)
      setApiConnected(false)
    } finally {
      setIsRetrying(false)
      setDataLoading(false)
    }
  }

  const handleTabSwitch = (tab) => {
    setActiveTab(tab)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Delete item handler using backend API
  const handleDeleteItem = (productId) => {
    if (!authToken || !user) {
      showToast('Please login to delete items', 'error')
      setShowAuthModal(true)
      return
    }

    console.log('Attempting to delete product:', productId)

    const confirmTitle = isAdmin ? 'Delete Listing (Admin)' : 'Delete Listing'
    const confirmMessage = isAdmin
      ? 'Are you sure you want to delete this listing? This action cannot be undone.'
      : 'Are you sure you want to delete this listing? This action cannot be undone.'

    showConfirmModal(confirmTitle, confirmMessage, async () => {
      closeConfirmModal()
      try {
        // Call backend API to delete product
        const response = await api.deleteProduct(productId, authToken)

        if (response.status === 'success') {
          // Update state (removes from display immediately)
          setProducts(prevProducts => prevProducts.filter(p => p._id !== productId))
          setMyListings(prevListings => prevListings.filter(p => p._id !== productId))

          // Track deletion event
          trackListingDeleted(productId)

          showToast('Listing deleted successfully!', 'success')
        }
      } catch (error) {
        console.error('Failed to delete product:', error)
        showToast('Failed to delete listing. Please try again.', 'error')
      }
    })
  }

  // State for My Listings
  const [myListings, setMyListings] = useState([])
  const [myListingsLoading, setMyListingsLoading] = useState(false)

  // Fetch user's listings from backend API
  const fetchMyListings = async () => {
    if (!authToken || !user) {
      setMyListings([])
      return
    }

    setMyListingsLoading(true)
    try {
      const response = await api.getMyListings(authToken)
      if (response.status === 'success') {
        setMyListings(response.data.products)
      }
    } catch (error) {
      console.error('Failed to fetch my listings:', error)
      setMyListings([])
    } finally {
      setMyListingsLoading(false)
    }
  }

  // Fetch my listings when tab changes to 'my-listings' or user logs in
  useEffect(() => {
    if (activeTab === 'my-listings' && authToken && user) {
      fetchMyListings()
    }
  }, [activeTab, authToken, user])

  // Get device's listings (for backward compatibility)
  const getMyListings = () => {
    return myListings
  }

  // Sidebar promotional ads for mobile injection (Empty - ready for dynamic ads from backend)
  const sidebarAds = []

  // Native Ads (Empty - ready for dynamic ads from backend)
  const nativeAds = []

  // Search functionality
  const handleSearch = (e) => {
    e.preventDefault()
    // Clear any pending debounced searches
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    // Immediately perform search on form submit
    performSearch(searchQuery)
  }

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!value.trim()) {
      setShowSearchResults(false)
      setSearchResults([])
      return
    }

    // Debounce search: only search after user stops typing for 500ms
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value)
    }, 500)
  }

  // Separate search logic for both manual and auto search
  const performSearch = (query) => {
    if (!query?.trim()) return

    setIsSearching(true)
    setShowSearchResults(true)

    const searchTerm = query.toLowerCase().trim()

    // Track search event
    trackSearch(searchTerm)

    const results = products.filter(product => {
      // Search in title
      if (product.title?.toLowerCase().includes(searchTerm)) return true

      // Search in description
      if (product.description?.toLowerCase().includes(searchTerm)) return true

      // Search in category name
      if (product.category?.name?.toLowerCase().includes(searchTerm)) return true

      // Search in condition
      if (product.condition?.toLowerCase().includes(searchTerm)) return true

      // Search in price (convert to string)
      if (product.price?.toString().includes(searchTerm)) return true

      return false
    })

    setSearchResults(results)
    setIsSearching(false)
  }

  // Post item functionality
  const handlePostItem = () => {
    if (!user) {
      // User not logged in, show register modal with message
      setAuthModalMode('register')
      setAuthModalMessage('Create an account to post items and connect with buyers!')
      setShowAuthModal(true)
    } else {
      // User logged in, show post modal
      setShowPostModal(true)
    }
  }

  const handleClosePostModal = () => {
    setShowPostModal(false)
    setPostFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      condition: 'Good',
      images: [],
      location: { campus: '', building: '' },
      tags: [],
      contact: { phone: '', email: '' }
    })
    setSelectedImages([])
    setImagePreviewUrls([])
  }

  const handlePostFormChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setPostFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }))
    } else {
      setPostFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleSubmitPost = async (e) => {
    e.preventDefault()

    // Check authentication
    if (!authToken || !user) {
      showToast('Please login or register to post an item', 'error')
      setShowAuthModal(true)
      return
    }

    // Detailed validation
    if (!postFormData.title || postFormData.title.trim().length < 5) {
      showToast('Title must be at least 5 characters long', 'error')
      return
    }

    if (postFormData.title.trim().length > 100) {
      showToast('Title must not exceed 100 characters', 'error')
      return
    }

    if (!postFormData.description || postFormData.description.trim().length < 10) {
      showToast('Description must be at least 10 characters long', 'error')
      return
    }

    if (postFormData.description.trim().length > 2000) {
      showToast('Description must not exceed 2000 characters', 'error')
      return
    }

    if (!postFormData.price || parseFloat(postFormData.price) <= 0) {
      showToast('Please enter a valid price greater than 0', 'error')
      return
    }

    if (!postFormData.category) {
      showToast('Please select a category', 'error')
      return
    }

    if (selectedImages.length === 0) {
      showToast('Please upload at least one image', 'error')
      return
    }

    if (selectedImages.length > 3) {
      showToast('You can only upload up to 3 images', 'error')
      return
    }

    if (!postFormData.contact.phone || postFormData.contact.phone.trim().length === 0) {
      showToast('Please provide a contact phone number', 'error')
      return
    }

    setIsSubmittingPost(true)
    setUploadProgress('Preparing upload...')

    try {
      // Step 1: Upload images to Cloudinary via backend
      setUploadProgress(`Uploading ${selectedImages.length} image(s)...`)
      const formData = new FormData()
      for (let i = 0; i < selectedImages.length; i++) {
        if (selectedImages[i].file) {
          formData.append('images', selectedImages[i].file)
        }
      }

      const uploadResponse = await api.uploadProductImages(formData, authToken)

      if (uploadResponse.status !== 'success') {
        throw new Error('Failed to upload images')
      }

      // Step 2: Create product with uploaded image URLs
      setUploadProgress('Creating listing...')
      const productData = {
        title: postFormData.title,
        description: postFormData.description,
        price: parseFloat(postFormData.price),
        category: postFormData.category,
        condition: postFormData.condition,
        images: uploadResponse.data.images.map(img => ({
          url: img.url,
          publicId: img.publicId
        })),
        location: {
          campus: postFormData.location.campus || '',
          building: postFormData.location.building || ''
        },
        tags: postFormData.tags || [],
        contact: {
          phone: postFormData.contact.phone,
          email: postFormData.contact.email || ''
        }
      }

      const createResponse = await api.createProduct(productData, authToken)

      if (createResponse.status === 'success') {
        // Add the newly created product to the list immediately
        const newProduct = createResponse.data.product
        setProducts(prev => [newProduct, ...prev])

        // Track listing creation
        trackListingCreated(newProduct)

        showToast('Product listing created successfully!', 'success')
        handleClosePostModal()
      }

    } catch (error) {
      console.error('Failed to create product:', error)
      showToast(`Failed to create product listing: ${error.message || 'Please try again.'}`, 'error')
    } finally {
      setIsSubmittingPost(false)
      setUploadProgress('')
    }
  }

  // Compress image before upload (reduces file size for faster mobile uploads)
  const compressImage = async (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Calculate new dimensions (maintain aspect ratio)
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height

          // Draw and compress
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              // Create a new file from the compressed blob
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(compressedFile)
            },
            'image/jpeg',
            quality
          )
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  // Image upload functionality
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)

    // Validate file count
    if (files.length + selectedImages.length > 3) {
      showToast('You can only upload up to 3 images', 'error')
      return
    }

    // Validate file types and sizes
    const validFiles = []
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    for (const file of files) {
      if (!validImageTypes.includes(file.type)) {
        showToast(`${file.name} is not a valid image format. Please use JPG, PNG, or WebP.`, 'error')
        continue
      }
      if (file.size > maxSize) {
        showToast(`${file.name} is too large. Please use images under 5MB.`, 'error')
        continue
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    // Show compression message for large files
    const hasLargeFiles = validFiles.some(f => f.size > 1024 * 1024) // > 1MB
    if (hasLargeFiles) {
      showToast('Compressing images for faster upload...', 'info')
    }

    // Compress images before processing
    const compressedFiles = await Promise.all(
      validFiles.map(file => compressImage(file))
    )

    // Create preview URLs and store compressed files
    const newImageUrls = []
    const newImages = []

    compressedFiles.forEach((file, index) => {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      newImageUrls.push(previewUrl)

      // Convert to base64 for preview and store compressed file object for upload
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = {
          url: e.target.result,
          file: file, // Store the compressed file object for API upload
          name: file.name,
          size: file.size,
          type: file.type
        }
        newImages.push(imageData)

        // Update state when all files are processed
        if (newImages.length === compressedFiles.length) {
          setSelectedImages(prev => [...prev, ...newImages])
          setImagePreviewUrls(prev => [...prev, ...newImageUrls])
          if (hasLargeFiles) {
            showToast('Images compressed successfully!', 'success')
          }
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(imagePreviewUrls[index])

    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  // Category filtering functionality
  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null) // Deselect if already selected
    } else {
      setSelectedCategory(categoryId)
      // Track category view
      const category = categories.find(cat => cat._id === categoryId || cat.id === categoryId)
      if (category) {
        trackCategoryView(category.name)
      }
      // Scroll to product listings when category is selected
      setTimeout(() => {
        const listingsSection = document.getElementById('product-listings')
        if (listingsSection) {
          listingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
    setShowSearchResults(false) // Hide search results when filtering by category
  }

  // Campus filtering functionality
  const handleCampusSelect = (campusName) => {
    setSelectedCampus(campusName)
    setShowSearchResults(false) // Hide search results when filtering by campus
  }

  const getFilteredProducts = () => {
    let filtered = products

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product =>
        product.category?._id === selectedCategory || product.category?.id === selectedCategory
      )
    }

    // Filter by campus
    if (selectedCampus) {
      filtered = filtered.filter(product =>
        product.location?.campus?.toLowerCase() === selectedCampus.toLowerCase()
      )
    }

    return filtered
  }

  // Map API categories to UI format with real product counts
  const getMappedCategories = () => {
    return categories.map(category => {
      // Count actual products in this category
      const productCount = products.filter(product =>
        product.category?._id === category._id || product.category?.id === category._id
      ).length

      return {
        id: category._id,
        name: category.name,
        icon: category.icon || '📦',
        itemCount: productCount
      }
    })
  }

  // Map API products to UI format
  const getMappedProducts = () => {
    const filteredProducts = getFilteredProducts()
    return filteredProducts.map(product => ({
      id: product._id,
      _id: product._id, // Keep _id for delete functionality
      title: product.title,
      price: product.price,
      category: product.category?.name || 'Unknown',
      seller: product.seller?.name || 'Anonymous',
      images: product.images?.map(img => img.url) || ['📦'],
      condition: product.condition,
      description: product.description,
      contact: {
        whatsapp: product.seller?.whatsapp || '',
        phone: product.seller?.phone || '',
        email: product.seller?.email || ''
      }
    }))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Premium Navigation Bar */}
      <nav className="sticky top-0 z-50 header-premium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Tap 7 times for admin access */}
            <div
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={handleLogoTap}
              title="E-Soko"
            >
              <div className="bg-gradient-to-br from-teal-400 to-teal-600 p-2 rounded-xl shadow-lg">
                <ShoppingBag className="text-white" size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight">E-Soko</span>
                <span className="text-[10px] text-slate-400 font-medium -mt-1 hidden sm:block">Campus Marketplace</span>
              </div>
              {/* API Connection Status */}
              {!loading && (
                <div className={`ml-1 w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}
                     title={apiConnected ? 'Connected to backend' : 'Backend connection failed'} />
              )}
              {isAdmin && (
                <span className="ml-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => handleTabSwitch('marketplace')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'marketplace'
                    ? 'bg-white/10 text-teal-400'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Marketplace
              </button>

              <button
                onClick={() => handleTabSwitch('my-listings')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'my-listings'
                    ? 'bg-white/10 text-teal-400'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                My Listings
              </button>

              <button
                onClick={() => handleTabSwitch('about')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'about'
                    ? 'bg-white/10 text-teal-400'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                About
              </button>

              {isAdmin && (
                <button
                  onClick={() => handleTabSwitch('ad-manager')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'ad-manager'
                      ? 'bg-white/10 text-teal-400'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Ad Manager
                </button>
              )}

              <div className="w-px h-8 bg-slate-600 mx-2"></div>

              <button
                onClick={handlePostItem}
                className="flex items-center gap-2 btn-cta px-5 py-2.5 text-sm"
              >
                <Plus size={18} strokeWidth={2.5} />
                Sell Now
              </button>

              {/* User Menu - Show logout only when logged in */}
              {user && (
                <div className="flex items-center gap-3 ml-2">
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                    <div className="w-7 h-7 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-white font-medium">{user.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all text-sm"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              )}

              {/* Admin Logout */}
              {isAdmin && (
                <button
                  onClick={handleAdminLogout}
                  className="flex items-center gap-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ml-2"
                >
                  <LogOut size={14} />
                  Exit Admin
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white hover:text-[#B86B3E] transition-colors p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu Sidebar */}
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 mobile-menu-overlay z-40 md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Sidebar */}
              <div className="fixed top-0 right-0 h-full w-72 mobile-menu-sidebar z-50 md:hidden animate-slideInRight">
                <div className="flex flex-col h-full">
                  {/* Sidebar Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-teal-400 to-teal-600 p-2 rounded-xl">
                        <ShoppingBag className="text-white" size={20} />
                      </div>
                      <span className="font-bold text-slate-800">Menu</span>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <X size={22} />
                    </button>
                  </div>

                  {/* Sidebar Content */}
                  <div className="flex-1 overflow-y-auto py-4">
                    <div className="flex flex-col gap-1 px-3">
                      <button
                        onClick={() => {
                          handleTabSwitch('marketplace')
                          setMobileMenuOpen(false)
                        }}
                        className={`text-left font-semibold py-3 px-4 rounded-xl transition-all duration-200 ${
                          activeTab === 'marketplace'
                            ? 'bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-600 border-l-4 border-teal-500'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Marketplace
                      </button>

                      <button
                        onClick={() => {
                          handleTabSwitch('my-listings')
                          setMobileMenuOpen(false)
                        }}
                        className={`text-left font-semibold py-3 px-4 rounded-xl transition-all duration-200 ${
                          activeTab === 'my-listings'
                            ? 'bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-600 border-l-4 border-teal-500'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        My Listings
                      </button>

                      <button
                        onClick={() => {
                          handleTabSwitch('about')
                          setMobileMenuOpen(false)
                        }}
                        className={`text-left font-semibold py-3 px-4 rounded-xl transition-all duration-200 ${
                          activeTab === 'about'
                            ? 'bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-600 border-l-4 border-teal-500'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        About
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            handleTabSwitch('ad-manager')
                            setMobileMenuOpen(false)
                          }}
                          className={`text-left font-semibold py-3 px-4 rounded-xl transition-all duration-200 ${
                            activeTab === 'ad-manager'
                              ? 'bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-600 border-l-4 border-teal-500'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          Ad Manager
                        </button>
                      )}

                      <div className="border-t border-slate-200 my-4"></div>

                      <button
                        onClick={() => {
                          handlePostItem()
                          setMobileMenuOpen(false)
                        }}
                        className="btn-cta flex items-center justify-center gap-2 w-full py-3.5"
                      >
                        <Plus size={20} strokeWidth={2.5} />
                        Sell Now
                      </button>

                      {/* Mobile User Menu */}
                      {user && (
                        <>
                          <div className="border-t border-slate-200 my-4"></div>
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl">
                              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                                {user.username?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800">{user.username}</p>
                                <p className="text-xs text-slate-500">Logged in</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                handleLogout()
                                setMobileMenuOpen(false)
                              }}
                              className="flex items-center justify-center gap-2 bg-slate-200 text-slate-700 px-4 py-3 rounded-xl hover:bg-slate-300 transition-colors font-medium w-full"
                            >
                              <LogOut size={18} />
                              Logout
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section - Premium Design */}
      {activeTab === 'marketplace' && (
        <section className="hero-gradient py-16 md:py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Main Hero Content */}
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                Your Campus
                <span className="block gradient-text">Marketplace</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Buy and sell with fellow students. Safe, local, and trusted by thousands of students.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                <div className="trust-badge">
                  <Shield size={16} />
                  <span>Verified Students</span>
                </div>
                <div className="trust-badge">
                  <Zap size={16} />
                  <span>Instant Connect</span>
                </div>
                <div className="trust-badge">
                  <Users size={16} />
                  <span>Campus Community</span>
                </div>
              </div>
            </div>

            {/* Premium Search Bar */}
            <form onSubmit={handleSearch} className="search-premium flex items-center max-w-3xl mx-auto">
              <div className="search-icon">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search items..."
                className="search-input"
              />
              <button
                type="submit"
                className="search-btn"
                disabled={isSearching || !searchQuery.trim()}
              >
                <span className="search-btn-text">{isSearching ? 'Searching...' : 'Search'}</span>
                <Search size={18} className="search-btn-icon" />
              </button>
            </form>

            {/* Quick Stats */}
            <div className="flex justify-center gap-8 md:gap-16 mt-10 text-center">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-white">{products.length}+</p>
                <p className="text-slate-400 text-sm">Active Listings</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-white">{campuses.length}+</p>
                <p className="text-slate-400 text-sm">Campuses</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-white">{categories.length}</p>
                <p className="text-slate-400 text-sm">Categories</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Connection Failed Banner */}
      {!apiConnected && !dataLoading && !loading && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <WifiOff className="text-amber-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-amber-800">Connection Issue</p>
                  <p className="text-sm text-amber-600">
                    {retryCount > 0
                      ? `Unable to connect after ${retryCount} ${retryCount === 1 ? 'attempt' : 'attempts'}. The server may be starting up.`
                      : 'Unable to connect to the server. It may be waking up from sleep.'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRetryConnection}
                disabled={isRetrying}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Connecting...
                  </>
                ) : (
                  <>
                    <RefreshCw size={18} />
                    Try Again
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Retrying Banner (shown while retrying in background) */}
      {isRetrying && apiConnected && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={18} />
              <p className="text-sm text-blue-700 font-medium">Refreshing data...</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'marketplace' && (
          <>
            <div>
              {/* Main Content Column */}
              <div>
              {/* Search Results - Premium Design */}
              {showSearchResults && (
                <section className="mb-14">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="section-title">
                        Search Results for "{searchQuery}"
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowSearchResults(false)}
                      className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <X size={22} />
                    </button>
                  </div>

                  {isSearching ? (
                    <div className="text-center py-16">
                      <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin mx-auto"></div>
                      <p className="text-slate-500 mt-4 font-medium">Searching...</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-2xl">
                      <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Search className="text-slate-400" size={32} />
                      </div>
                      <p className="text-slate-700 text-lg font-medium">No items found for "{searchQuery}"</p>
                      <p className="text-slate-500 text-sm mt-2">Try using different keywords or browse by category</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {searchResults.map((item, index) => (
                        <div
                          key={`search-result-${item._id}-${index}`}
                          className="product-card cursor-pointer"
                          onClick={() => setSelectedProduct(item)}
                        >
                          <div className="product-image-container">
                            <img
                              src={item.images?.[0]?.url || item.images?.[0] || 'https://via.placeholder.com/300x200'}
                              alt={item.title}
                              loading="lazy"
                            />
                          </div>
                          <div className="p-4">
                            <p className="text-lg font-bold text-slate-900 mb-1">KES {item.price?.toLocaleString()}</p>
                            <h3 className="text-sm text-slate-700 line-clamp-2 mb-2">{item.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className={`px-2 py-0.5 rounded ${
                                item.condition === 'Like New' || item.condition === 'Excellent'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {item.condition}
                              </span>
                              <span>{item.category?.name || item.category}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Browse by Category - Premium Design */}
              <section className="mb-14">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="section-title">Browse by Category</h2>
                  </div>
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="btn-secondary text-sm px-4 py-2"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>

                {selectedCategory && (
                  <div className="mb-6 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-3xl">{categories.find(cat => cat._id === selectedCategory)?.icon || '📦'}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-teal-800 font-semibold">
                          Filtering by: {categories.find(cat => cat._id === selectedCategory)?.name || 'Category'}
                        </p>
                        <p className="text-teal-600 text-sm mt-0.5">
                          Showing {getFilteredProducts().length} {getFilteredProducts().length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {dataLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <div key={`category-skeleton-${index}`} className="bg-white rounded-xl p-5 border border-slate-200">
                        <div className="skeleton rounded-xl w-12 h-12 mx-auto mb-3"></div>
                        <div className="skeleton h-4 rounded mb-2 w-3/4 mx-auto"></div>
                        <div className="skeleton h-3 rounded w-1/2 mx-auto"></div>
                      </div>
                    ))
                  ) : (
                    getMappedCategories().map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className={`bg-white rounded-lg p-5 text-center border transition-all ${
                          selectedCategory === category.id
                            ? 'border-[#3E5C50] shadow-sm'
                            : 'border-[#D6D1CA] hover:border-[#3E5C50] hover:shadow-sm'
                        }`}
                      >
                        <div className="w-12 h-12 mx-auto mb-3 bg-[#F5F2ED] rounded-lg flex items-center justify-center">
                          <span className="text-2xl">{category.icon}</span>
                        </div>
                        <h3 className={`font-semibold text-sm mb-1 ${
                          selectedCategory === category.id ? 'text-[#3E5C50]' : 'text-[#1E1E1E]'
                        }`}>{category.name}</h3>
                        <p className="text-xs text-[#5A5A5A]">{category.itemCount} items</p>
                      </button>
                    ))
                  )}
                </div>
              </section>

            {/* Browse by Campus Section - Premium Design */}
            <section className="mb-14">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="section-title">Browse by Campus</h2>
                </div>
                {selectedCampus && (
                  <button
                    onClick={() => setSelectedCampus(null)}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    Clear Campus
                  </button>
                )}
              </div>

              <CampusList
                campuses={campuses}
                selectedCampus={selectedCampus}
                onCampusSelect={handleCampusSelect}
                loading={campusesLoading}
                products={products}
              />

              {selectedCampus && (
                <div className="mt-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-2xl">📍</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-emerald-800 font-semibold">
                        Filtering by: {selectedCampus}
                      </p>
                      <p className="text-emerald-600 text-sm mt-0.5">
                        Showing {getFilteredProducts().length} {getFilteredProducts().length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Product Listings with Sidebar */}
            <div className="flex gap-6">
              {/* Main Content - Scrollable */}
              <div className="flex-1 min-w-0 max-h-[800px] overflow-y-auto pr-2 scroll-container">
            {/* Recent Listings Section */}
            <section id="product-listings">
              {/* Header with Sort */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="section-title">
                      {selectedCategory
                        ? `${categories.find(cat => cat._id === selectedCategory)?.name || 'Category'} Items`
                        : selectedCampus
                          ? `Items at ${selectedCampus}`
                          : 'Recent Listings'
                      }
                    </h2>
                    <span className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-sm">
                      {getFilteredProducts().length} {getFilteredProducts().length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  {(selectedCategory || selectedCampus) && (
                    <button
                      onClick={() => {
                        setSelectedCategory(null)
                        setSelectedCampus(null)
                      }}
                      className="text-sm text-teal-600 hover:text-teal-700 mt-3 flex items-center gap-1 hover:gap-2 transition-all font-medium"
                    >
                      ← Clear all filters
                    </button>
                  )}
                </div>
                <div className="relative">
                  <select className="appearance-none bg-white border-2 border-slate-200 rounded-xl px-5 py-2.5 pr-12 text-sm font-medium text-slate-700 hover:border-teal-400 focus:outline-none focus:border-teal-500 cursor-pointer transition-colors shadow-sm">
                    <option>Sort by: Recent</option>
                    <option>Sort by: Price Low to High</option>
                    <option>Sort by: Price High to Low</option>
                    <option>Sort by: Popular</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>

              {/* Loading skeleton for products */}
              {dataLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={`product-skeleton-${index}`} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                      <div className="bg-gray-200 aspect-[4/3] w-full"></div>
                      <div className="p-4">
                        <div className="bg-gray-200 h-5 rounded mb-2 w-2/3"></div>
                        <div className="bg-gray-200 h-4 rounded w-full mb-2"></div>
                        <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedCategory && getFilteredProducts().length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-6xl mb-4">
                    {categories.find(cat => cat._id === selectedCategory)?.icon || '📦'}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No items in {categories.find(cat => cat._id === selectedCategory)?.name || 'this category'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Be the first to list an item in this category!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Browse All Items
                    </button>
                    <button
                      onClick={handlePostItem}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Post Item
                    </button>
                  </div>
                </div>
              ) : getMappedProducts().length === 0 ? (
                <div className="text-center py-20 bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/30 rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-3xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                    <ShoppingBag className="text-white" size={48} />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-3">
                    Welcome to E-Soko!
                  </h3>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto text-lg">
                    No items listed yet. Be the first to share what you're selling with the campus community!
                  </p>
                  <button
                    onClick={handlePostItem}
                    className="btn-cta inline-flex items-center gap-2 px-10 py-4 text-lg shadow-xl shadow-orange-500/20"
                  >
                    <Plus size={22} strokeWidth={2.5} />
                    List Your First Item
                  </button>
                  <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Upload className="text-teal-600" size={24} />
                      </div>
                      <p className="font-semibold text-slate-800">Upload Photos</p>
                      <p className="text-sm text-slate-500 mt-1">Add up to 5 images</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Tag className="text-emerald-600" size={24} />
                      </div>
                      <p className="font-semibold text-slate-800">Set Your Price</p>
                      <p className="text-sm text-slate-500 mt-1">Competitive pricing</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Users className="text-orange-600" size={24} />
                      </div>
                      <p className="font-semibold text-slate-800">Connect</p>
                      <p className="text-sm text-slate-500 mt-1">Meet campus buyers</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Listings Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {getMappedProducts().map((item, index) => {
                      return (
                        <React.Fragment key={`item-${item.id}-${index}`}>
                          {/* Product Card */}
                          <div
                            onClick={() => setSelectedProduct(item)}
                            className="product-card cursor-pointer"
                          >
                            {/* Image */}
                            <div className="product-image-container">
                              {item.images[0]?.startsWith('data:') || item.images[0]?.startsWith('http') ? (
                                <img
                                  src={item.images[0]}
                                  alt={item.title}
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    e.target.nextSibling.style.display = 'flex'
                                  }}
                                />
                              ) : null}
                              <div
                                className="w-full h-full flex items-center justify-center bg-slate-100"
                                style={{ display: item.images[0]?.startsWith('data:') || item.images[0]?.startsWith('http') ? 'none' : 'flex' }}
                              >
                                <span className="text-5xl">{item.images[0] || '📦'}</span>
                              </div>

                              {/* Image Count */}
                              {item.images.length > 1 && (
                                <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                  1/{item.images.length}
                                </span>
                              )}
                            </div>

                            {/* Info */}
                            <div className="p-4">
                              <p className="text-lg font-bold text-slate-900 mb-1">
                                KES {item.price.toLocaleString()}
                              </p>
                              <h3 className="text-sm text-slate-700 line-clamp-2 mb-2">
                                {item.title}
                              </h3>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className={`px-2 py-0.5 rounded ${
                                  item.condition === 'Like New' || item.condition === 'Excellent'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {item.condition}
                                </span>
                                <span>{item.category}</span>
                              </div>
                              {item.sponsored?.isSponsored && (
                                <div className="mt-2">
                                  <SponsoredBadge size="small" variant="default" />
                                </div>
                              )}
                              {isAdmin && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteItem(item._id)
                                  }}
                                  className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded transition-colors"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </React.Fragment>
                      )
                    })}
                  </div>
                </>
              )}
            </section>
              </div>

              {/* Right Sidebar - Ads (Large screens only) */}
              <aside className="hidden lg:block w-72 flex-shrink-0">
                <div className="sticky top-24 space-y-4">
                  {/* Ad Slot 1 */}
                  <AdDisplay position="sidebar" />

                  {/* Promo Banner */}
                  <div className="bg-[#3E5C50] rounded-lg p-5 text-white">
                    <h4 className="font-bold mb-2">Sell Your Items</h4>
                    <p className="text-sm text-white/80 mb-4">List your items for free and reach thousands of students.</p>
                    <button
                      onClick={handlePostItem}
                      className="w-full bg-[#B86B3E] hover:bg-[#A85F36] text-white font-semibold py-2 rounded-lg text-sm transition-colors"
                    >
                      Start Selling
                    </button>
                  </div>

                  {/* Ad Slot 2 */}
                  <AdDisplay position="sidebar" />
                </div>
              </aside>
            </div>
            </div>
            </div>
          </>
        )}

        {/* My Listings Tab - Premium Design */}
        {activeTab === 'my-listings' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">My Listings</h1>
              <p className="text-slate-500">Manage your posted items</p>
            </div>

            {/* Check if user is logged in */}
            {!authToken || !user ? (
              <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-3xl border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 mx-auto mb-6 bg-slate-200 rounded-2xl flex items-center justify-center">
                  <User className="text-slate-400" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  Login Required
                </h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  Please login or register to view and manage your listings
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="btn-primary inline-flex items-center gap-2 px-8 py-3"
                >
                  <User size={20} />
                  Login / Register
                </button>
              </div>
            ) : myListingsLoading ? (
              <div className="text-center py-20">
                <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 font-medium">Loading your listings...</p>
              </div>
            ) : getMyListings().length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-3xl border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                  <ShoppingBag className="text-white" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  No listings yet
                </h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  You haven't posted any items for sale yet. Start selling today!
                </p>
                <button
                  onClick={handlePostItem}
                  className="btn-cta inline-flex items-center gap-2 px-8 py-3"
                >
                  <Plus size={20} strokeWidth={2.5} />
                  Post Your First Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {getMyListings().map((item) => (
                  <div
                    key={item._id}
                    className="product-card"
                  >
                    {/* Image */}
                    <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-48 flex items-center justify-center overflow-hidden">
                      {item.images[0]?.url?.startsWith('data:') || item.images[0]?.url?.startsWith('http') ? (
                        <img
                          src={item.images[0].url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-7xl">{item.images[0]?.url || '📦'}</span>
                      )}

                      {/* Status Badge */}
                      <span className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-semibold ${
                        item.status === 'available'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {item.status === 'available' ? 'Available' : 'Sold'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">
                        {item.title}
                      </h3>
                      <p className="text-blue-600 font-bold text-xl mb-3">
                        KES {item.price.toLocaleString()}
                      </p>

                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {item.category?.name || 'Unknown'}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {item.condition}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedProduct({
                            id: item._id,
                            title: item.title,
                            price: item.price,
                            category: item.category?.name || 'Unknown',
                            seller: item.seller?.name || 'You',
                            images: item.images?.map(img => img.url) || ['📦'],
                            condition: item.condition,
                            description: item.description,
                            contact: {
                              phone: item.seller?.phone || '',
                              email: item.seller?.email || ''
                            }
                          })}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* About Us Tab */}
        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">About E-Soko</h1>
              <p className="text-gray-600">Your trusted marketplace</p>
            </div>

            {/* Introduction */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Are</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                E-Soko is a <strong>free advertisement platform</strong> designed to connect campus community members for buying and selling items. We provide a space where students can post and browse listings for textbooks, electronics, furniture, and more.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Important:</strong> E-Soko is purely an advertisement website. We do not process payments, facilitate transactions, or handle any in-app purchases. All transactions occur directly between buyers and sellers.
              </p>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                <span>⚠️</span> Important Safety Notice
              </h3>
              <ul className="space-y-2 text-yellow-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-1">•</span>
                  <span><strong>Be Cautious:</strong> Always verify items before making purchases. Meet in safe, public locations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-1">•</span>
                  <span><strong>No Liability:</strong> E-Soko is not responsible for any fraudulent activities, scams, or disputes between buyers and sellers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-1">•</span>
                  <span><strong>Direct Transactions:</strong> All communications and payments happen directly between users. We do not mediate or guarantee transactions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-1">•</span>
                  <span><strong>Your Responsibility:</strong> Exercise good judgment and common sense when buying or selling items.</span>
                </li>
              </ul>
            </div>

            {/* Help Center */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Help Center</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How to Post an Item</h3>
                  <p className="text-gray-700 text-sm">Click the "Post Item" button in the navigation bar. Fill in the details including title, description, price, images, and your contact information. Your item will appear in the marketplace immediately.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How to Browse Items</h3>
                  <p className="text-gray-700 text-sm">Use the search bar to find specific items, or browse by category. Click on any item to view full details and seller contact information.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How to Contact Sellers</h3>
                  <p className="text-gray-700 text-sm">Click on any item to view details. In the product details page, you'll find the seller's phone number and email (if provided). Contact them directly to arrange purchases.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Managing Your Listings</h3>
                  <p className="text-gray-700 text-sm">Visit "My Listings" to view all items you've posted from this device. You can delete items once they're sold.</p>
                </div>
              </div>
            </div>

            {/* Contact Us */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">Have questions, need assistance, or want to report an issue? Reach out to us:</p>
              <div className="space-y-3 text-gray-700">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-lg"><strong>Email:</strong> <a href="mailto:esokostore1@gmail.com" className="text-blue-600 hover:underline">esokostore1@gmail.com</a></p>
                  <p className="text-sm text-gray-600 mt-2">Use this email for all inquiries including:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4 mt-1">
                    <li>• General questions and support</li>
                    <li>• Reporting fraudulent listings</li>
                    <li>• Technical issues</li>
                    <li>• Account assistance</li>
                    <li>• Feedback and suggestions</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-600"><strong>Response Time:</strong> We aim to respond within 24-48 hours</p>
              </div>
            </div>

            {/* Tips for Reporting Issues */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Reporting Issues</h2>
              <p className="text-gray-700 mb-4">When reporting a problem, please include:</p>
              <div className="space-y-2">
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="text-gray-700 text-sm space-y-2">
                    <li>• <strong>For Fraudulent Listings:</strong> Link or screenshot, description of the issue, and any relevant evidence</li>
                    <li>• <strong>For Technical Issues:</strong> Detailed description of the problem, steps to reproduce, and device/browser information</li>
                    <li>• <strong>For General Inquiries:</strong> Clear description of your question or concern</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ad Manager Tab */}
        {activeTab === 'ad-manager' && (
          <AdManager authToken={authToken} showToast={showToast} showConfirmModal={showConfirmModal} closeConfirmModal={closeConfirmModal} />
        )}
      </main>

      {/* Product Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedProduct(null)
              setCurrentImageIndex(0)
              setIsImageFullscreen(false)
              setImageZoomLevel(1)
            }
          }}
        >
          <div className="bg-white rounded-xl max-w-5xl w-full my-4 sm:my-8 relative max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedProduct(null)
                setCurrentImageIndex(0)
                setIsImageFullscreen(false)
                setImageZoomLevel(1)
              }}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
            >
              <X size={24} className="text-gray-700" />
            </button>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 p-4 sm:p-6 md:p-8">
              {/* Left Column - Image Gallery */}
              <div className="space-y-4">
                {/* Main Image Display - Larger on mobile */}
                <div
                  className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-80 sm:h-96 md:h-[28rem] flex items-center justify-center overflow-hidden cursor-zoom-in"
                  onClick={() => {
                    const currentImage = selectedProduct.images?.[currentImageIndex] || selectedProduct.image
                    if (currentImage?.startsWith('data:') || currentImage?.startsWith('http')) {
                      setIsImageFullscreen(true)
                      setImageZoomLevel(1)
                    }
                  }}
                >
                  {(() => {
                    // Handle both 'image' (official store) and 'images' (marketplace) formats
                    const currentImage = selectedProduct.images?.[currentImageIndex] || selectedProduct.image
                    const isImageUrl = currentImage?.startsWith('data:') || currentImage?.startsWith('http')

                    return isImageUrl ? (
                      <img
                        src={currentImage}
                        alt={`${selectedProduct.title} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null
                  })()}
                  <div
                    className="w-full h-full flex items-center justify-center transition-all duration-300"
                    style={{
                      display: (() => {
                        const currentImage = selectedProduct.images?.[currentImageIndex] || selectedProduct.image
                        return currentImage?.startsWith('data:') || currentImage?.startsWith('http') ? 'none' : 'flex'
                      })()
                    }}
                  >
                    <span className="text-6xl sm:text-7xl md:text-8xl">
                      {selectedProduct.images?.[currentImageIndex] || selectedProduct.image || '📦'}
                    </span>
                  </div>

                  {/* Tap to zoom hint */}
                  {(() => {
                    const currentImage = selectedProduct.images?.[currentImageIndex] || selectedProduct.image
                    const isImageUrl = currentImage?.startsWith('data:') || currentImage?.startsWith('http')
                    return isImageUrl ? (
                      <div className="absolute top-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        <Search size={12} />
                        Tap to zoom
                      </div>
                    ) : null
                  })()}

                  {/* Previous Button */}
                  {selectedProduct.images && currentImageIndex > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentImageIndex(currentImageIndex - 1)
                      }}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                    >
                      <ChevronLeft size={20} className="text-gray-700 sm:w-6 sm:h-6" />
                    </button>
                  )}

                  {/* Next Button */}
                  {selectedProduct.images && currentImageIndex < selectedProduct.images.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentImageIndex(currentImageIndex + 1)
                      }}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                    >
                      <ChevronRight size={20} className="text-gray-700 sm:w-6 sm:h-6" />
                    </button>
                  )}

                  {/* Image Counter */}
                  {selectedProduct.images && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {currentImageIndex + 1} / {selectedProduct.images.length}
                    </div>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {selectedProduct.images && (
                  <div className="flex gap-2 justify-center overflow-x-auto pb-2">
                    {selectedProduct.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentImageIndex(index)
                      }}
                      className={`bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center border-2 transition-all duration-200 flex-shrink-0 overflow-hidden ${
                        currentImageIndex === index
                          ? 'border-blue-600 scale-105 shadow-md'
                          : 'border-transparent hover:border-gray-400 hover:scale-105'
                      }`}
                    >
                      {image?.startsWith('data:') || image?.startsWith('http') ? (
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <span
                        className="text-2xl sm:text-3xl"
                        style={{ display: image?.startsWith('data:') || image?.startsWith('http') ? 'none' : 'block' }}
                      >
                        {image || '📦'}
                      </span>
                    </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column - Product Details */}
              <div className="space-y-4 sm:space-y-6">
                {/* Title and Price */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {selectedProduct.title}
                  </h2>
                  <p className="text-3xl sm:text-4xl font-bold text-blue-600">
                    KES {selectedProduct.price.toLocaleString()}
                  </p>
                </div>

                {/* Category and Condition */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedProduct.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedProduct.condition === 'Like New' || selectedProduct.condition === 'Excellent'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedProduct.condition}
                  </span>
                </div>

                {/* Analytics - Views & Contact Reveals */}
                {(selectedProduct.views || selectedProduct.contactReveals) && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center justify-around gap-4">
                      {selectedProduct.views !== undefined && (
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{selectedProduct.views}</p>
                          <p className="text-xs text-gray-600">Views</p>
                        </div>
                      )}
                      {selectedProduct.contactReveals !== undefined && (
                        <div className="text-center">
                          <p className="text-2xl font-bold text-pink-600">{selectedProduct.contactReveals}</p>
                          <p className="text-xs text-gray-600">Contact Reveals</p>
                        </div>
                      )}
                      {selectedProduct.views > 0 && selectedProduct.contactReveals > 0 && (
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {Math.round((selectedProduct.contactReveals / selectedProduct.views) * 100)}%
                          </p>
                          <p className="text-xs text-gray-600">Interest Rate</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Contact Seller - Privacy Protected (for database products only) */}
                {selectedProduct._id &&
                 !selectedProduct._id.toString().startsWith('local_') &&
                 !selectedProduct.contactEmail &&
                 !selectedProduct.contactPhone && (
                  <ContactReveal
                    productId={selectedProduct._id}
                    sellerId={selectedProduct.seller?._id}
                  />
                )}

                {/* Contact Seller - Direct (for local products or products with seller info) */}
                {(selectedProduct._id?.toString().startsWith('local_') ||
                  (!selectedProduct._id && selectedProduct.seller)) &&
                 !selectedProduct.contactEmail &&
                 !selectedProduct.contactPhone &&
                 (selectedProduct.seller || selectedProduct.contact) && (
                  <LocalContactReveal
                    product={selectedProduct}
                  />
                )}

                {/* Official Store Contact - Only for official store items */}
                {(selectedProduct.contactEmail || selectedProduct.contactPhone) && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Contact Official Store</h3>

                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-4 space-y-3">
                      {/* Phone */}
                      {selectedProduct.contactPhone && (
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-100 p-2 rounded-lg">
                            <Phone size={20} className="text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Phone</p>
                            <a
                              href={`tel:${selectedProduct.contactPhone}`}
                              className="text-orange-600 font-semibold hover:underline"
                            >
                              {selectedProduct.contactPhone}
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Email */}
                      {selectedProduct.contactEmail && (
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-100 p-2 rounded-lg">
                            <Mail size={20} className="text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Email</p>
                            <a
                              href={`mailto:${selectedProduct.contactEmail}`}
                              className="text-orange-600 font-semibold hover:underline break-all"
                            >
                              {selectedProduct.contactEmail}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Official Store Link - Only for official store items */}
                {selectedProduct.link && (
                  <div className="border-t pt-6">
                    <a
                      href={selectedProduct.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      Visit Official Store
                    </a>
                  </div>
                )}

                {/* Admin Delete Button */}
                {isAdmin && selectedProduct._id && (
                  <div className="border-t pt-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteItem(selectedProduct._id)
                        setSelectedProduct(null)
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={20} />
                      Admin: Delete This Item
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Zoom Modal */}
      {isImageFullscreen && selectedProduct && (
        <div
          className="fixed inset-0 bg-black z-[60] flex flex-col"
          onClick={() => {
            setIsImageFullscreen(false)
            setImageZoomLevel(1)
          }}
        >
          {/* Header Controls */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
            <div className="text-white text-sm font-medium">
              {selectedProduct.images && `${currentImageIndex + 1} / ${selectedProduct.images.length}`}
            </div>
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setImageZoomLevel(prev => Math.max(0.5, prev - 0.5))
                }}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              >
                <span className="text-xl font-bold">-</span>
              </button>
              <span className="text-white text-sm font-medium min-w-[4rem] text-center">
                {Math.round(imageZoomLevel * 100)}%
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setImageZoomLevel(prev => Math.min(3, prev + 0.5))
                }}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              >
                <span className="text-xl font-bold">+</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsImageFullscreen(false)
                  setImageZoomLevel(1)
                }}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors ml-2"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Main Image Container */}
          <div
            className="flex-1 flex items-center justify-center overflow-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedProduct.images?.[currentImageIndex] || selectedProduct.image}
              alt={`${selectedProduct.title} - Fullscreen`}
              className="max-w-none transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${imageZoomLevel})`,
                maxHeight: imageZoomLevel <= 1 ? '100%' : 'none',
                maxWidth: imageZoomLevel <= 1 ? '100%' : 'none',
              }}
              onClick={(e) => {
                e.stopPropagation()
                // Toggle between 1x and 2x on tap
                setImageZoomLevel(prev => prev === 1 ? 2 : 1)
              }}
              draggable={false}
            />
          </div>

          {/* Navigation Arrows */}
          {selectedProduct.images && currentImageIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setCurrentImageIndex(currentImageIndex - 1)
                setImageZoomLevel(1)
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-colors"
            >
              <ChevronLeft size={32} />
            </button>
          )}
          {selectedProduct.images && currentImageIndex < selectedProduct.images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setCurrentImageIndex(currentImageIndex + 1)
                setImageZoomLevel(1)
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-colors"
            >
              <ChevronRight size={32} />
            </button>
          )}

          {/* Bottom Hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm text-center">
            Tap image to zoom in/out • Use +/- buttons to adjust
          </div>
        </div>
      )}

      {/* Post Item Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-[#F5F2ED] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            style={{ animation: 'modalSlideIn 0.3s ease-out' }}
          >
            {/* Modal Header */}
            <div className="bg-[#3E5C50] px-6 py-5">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">List Your Item</h2>
                  <p className="text-[#A8C5B8] text-sm mt-1">Reach thousands of campus buyers</p>
                </div>
                <button
                  onClick={handleClosePostModal}
                  className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
              <form onSubmit={handleSubmitPost} className="space-y-6">

                {/* Section: Basic Info */}
                <div className="bg-white rounded-xl p-5 border border-[#D6D1CA]">
                  <h3 className="text-sm font-semibold text-[#3E5C50] uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Tag size={16} />
                    Item Details
                  </h3>

                  {/* Title */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                      Title <span className="text-[#B86B3E]">*</span>
                    </label>
                    <input
                      type="text"
                      value={postFormData.title}
                      onChange={(e) => handlePostFormChange('title', e.target.value)}
                      className="w-full px-4 py-3 bg-[#F5F2ED] border border-[#D6D1CA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E5C50] focus:border-transparent text-[#1E1E1E] placeholder-[#5A5A5A]/60 transition-all"
                      placeholder="e.g., iPhone 13 Pro - Like New"
                      maxLength={100}
                      required
                    />
                    <p className={`text-xs mt-2 ${postFormData.title.length < 5 ? 'text-[#8C3A3A]' : 'text-[#5A5A5A]'}`}>
                      {postFormData.title.length}/100 characters {postFormData.title.length < 5 && '(minimum 5)'}
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                      Description <span className="text-[#B86B3E]">*</span>
                    </label>
                    <textarea
                      value={postFormData.description}
                      onChange={(e) => handlePostFormChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-[#F5F2ED] border border-[#D6D1CA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E5C50] focus:border-transparent text-[#1E1E1E] placeholder-[#5A5A5A]/60 transition-all resize-none"
                      placeholder="Describe your item - include condition, features, why you're selling..."
                      maxLength={2000}
                      required
                    />
                    <p className={`text-xs mt-2 ${postFormData.description.length < 10 ? 'text-[#8C3A3A]' : 'text-[#5A5A5A]'}`}>
                      {postFormData.description.length}/2000 characters {postFormData.description.length < 10 && '(minimum 10)'}
                    </p>
                  </div>
                </div>

                {/* Section: Pricing & Category */}
                <div className="bg-white rounded-xl p-5 border border-[#D6D1CA]">
                  <h3 className="text-sm font-semibold text-[#3E5C50] uppercase tracking-wide mb-4 flex items-center gap-2">
                    <ShoppingBag size={16} />
                    Pricing & Category
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        Price <span className="text-[#B86B3E]">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A5A5A] font-medium">KES</span>
                        <input
                          type="number"
                          value={postFormData.price}
                          onChange={(e) => handlePostFormChange('price', e.target.value)}
                          className="w-full pl-14 pr-4 py-3 bg-[#F5F2ED] border border-[#D6D1CA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E5C50] focus:border-transparent text-[#1E1E1E] transition-all"
                          placeholder="0"
                          min="0"
                          step="1"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        Category <span className="text-[#B86B3E]">*</span>
                      </label>
                      <select
                        value={postFormData.category}
                        onChange={(e) => handlePostFormChange('category', e.target.value)}
                        className="w-full px-4 py-3 bg-[#F5F2ED] border border-[#D6D1CA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E5C50] focus:border-transparent text-[#1E1E1E] transition-all appearance-none cursor-pointer"
                        required
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%235A5A5A'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        Condition
                      </label>
                      <select
                        value={postFormData.condition}
                        onChange={(e) => handlePostFormChange('condition', e.target.value)}
                        className="w-full px-4 py-3 bg-[#F5F2ED] border border-[#D6D1CA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E5C50] focus:border-transparent text-[#1E1E1E] transition-all appearance-none cursor-pointer"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%235A5A5A'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                      >
                        <option value="New">New</option>
                        <option value="Like New">Like New</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        Campus
                      </label>
                      <select
                        value={postFormData.location.campus}
                        onChange={(e) => handlePostFormChange('location.campus', e.target.value)}
                        className="w-full px-4 py-3 bg-[#F5F2ED] border border-[#D6D1CA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E5C50] focus:border-transparent text-[#1E1E1E] transition-all appearance-none cursor-pointer"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%235A5A5A'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                      >
                        <option value="">Select campus</option>
                        {campuses.filter(c => c.isActive).map((campus) => (
                          <option key={campus._id} value={campus.name}>
                            {campus.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section: Contact */}
                <div className="bg-white rounded-xl p-5 border border-[#D6D1CA]">
                  <h3 className="text-sm font-semibold text-[#3E5C50] uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Phone size={16} />
                    Contact Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        Phone Number <span className="text-[#B86B3E]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={postFormData.contact.phone}
                        onChange={(e) => handlePostFormChange('contact.phone', e.target.value)}
                        className="w-full px-4 py-3 bg-[#F5F2ED] border border-[#D6D1CA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E5C50] focus:border-transparent text-[#1E1E1E] placeholder-[#5A5A5A]/60 transition-all"
                        placeholder="0712 345 678"
                        required
                      />
                      <p className="text-xs text-[#5A5A5A] mt-2">Buyers will contact you here</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        Email <span className="text-[#5A5A5A] font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={postFormData.contact.email}
                        onChange={(e) => handlePostFormChange('contact.email', e.target.value)}
                        className="w-full px-4 py-3 bg-[#F5F2ED] border border-[#D6D1CA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E5C50] focus:border-transparent text-[#1E1E1E] placeholder-[#5A5A5A]/60 transition-all"
                        placeholder="your@email.com"
                      />
                      <p className="text-xs text-[#5A5A5A] mt-2">Alternative contact method</p>
                    </div>
                  </div>
                </div>

                {/* Section: Images */}
                <div className="bg-white rounded-xl p-5 border border-[#D6D1CA]">
                  <h3 className="text-sm font-semibold text-[#3E5C50] uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Upload size={16} />
                    Photos <span className="text-[#B86B3E]">*</span>
                    <span className="text-xs font-normal text-[#5A5A5A] ml-auto">Up to 3 images</span>
                  </h3>

                  {/* Image Previews */}
                  {imagePreviewUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-28 object-cover rounded-lg border-2 border-[#D6D1CA]"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="bg-[#8C3A3A] text-white rounded-full p-2 hover:bg-[#7A3232] transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          {index === 0 && (
                            <span className="absolute top-2 left-2 bg-[#3E5C50] text-white text-xs px-2 py-1 rounded font-medium">
                              Main
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Area */}
                  {selectedImages.length < 3 && (
                    <div className="border-2 border-dashed border-[#D6D1CA] rounded-xl p-8 text-center hover:border-[#3E5C50] hover:bg-[#F5F2ED]/50 transition-all cursor-pointer group">
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="w-16 h-16 bg-[#3E5C50]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#3E5C50]/20 transition-colors">
                          <Upload size={28} className="text-[#3E5C50]" />
                        </div>
                        <p className="text-[#1E1E1E] font-medium mb-1">
                          Click to upload photos
                        </p>
                        <p className="text-[#5A5A5A] text-sm">
                          JPG, PNG or WebP (max 5MB each)
                        </p>
                        <p className="text-[#B86B3E] text-sm font-medium mt-2">
                          {3 - selectedImages.length} {3 - selectedImages.length === 1 ? 'photo' : 'photos'} remaining
                        </p>
                      </label>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="bg-white border-t border-[#D6D1CA] px-6 py-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClosePostModal}
                  className="flex-1 px-5 py-3 border-2 border-[#D6D1CA] text-[#5A5A5A] rounded-xl hover:bg-[#F5F2ED] font-semibold transition-all"
                  disabled={isSubmittingPost}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitPost}
                  className="flex-1 px-5 py-3 bg-[#B86B3E] text-white rounded-xl hover:bg-[#A85F36] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#B86B3E]/25"
                  disabled={isSubmittingPost}
                >
                  {isSubmittingPost ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {uploadProgress || 'Posting...'}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Plus size={20} />
                      Post Item
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAdminLogin(false)
              setAdminPassword('')
            }
          }}
        >
          <div className="bg-white rounded-xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
              <button
                onClick={() => {
                  setShowAdminLogin(false)
                  setAdminPassword('')
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAdminLogin}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter admin password"
                  required
                  autoComplete="current-password"
                />
                <p className="text-xs text-gray-500 mt-2">
                  🔒 Secure admin access - Contact administrator if you've forgotten your password
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Login as Admin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false)
          setAuthModalMode('login')
          setAuthModalMessage('')
          setResetToken(null)
        }}
        onAuthSuccess={(userData, token) => {
          setUser(userData)
          setAuthToken(token)
          setAuthModalMode('login')
          setAuthModalMessage('')
          setResetToken(null)
        }}
        initialMode={authModalMode}
        message={authModalMessage}
        resetToken={resetToken}
      />

      {/* Pre-footer Ad Banner */}
      <section className="bg-[#F5F2ED] border-t border-b border-[#D6D1CA] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdDisplay position="banner" />
          <p className="text-center text-xs text-[#5A5A5A] mt-4">Interested in advertising? Contact us at esokostore1@gmail.com</p>
        </div>
      </section>

      {/* Footer - Premium Design */}
      <footer className="footer-premium text-[#D6D1CA]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Column 1 - Logo and Tagline */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-[#3E5C50] p-2.5 rounded-lg">
                  <ShoppingBag className="text-white" size={24} />
                </div>
                <div>
                  <span className="text-xl font-bold text-white">E-Soko</span>
                  <p className="text-xs text-[#D6D1CA]">Campus Marketplace</p>
                </div>
              </div>
              <p className="text-[#D6D1CA] text-sm leading-relaxed mb-6">
                Your trusted campus marketplace. Buy and sell with fellow students safely, easily, and locally.
              </p>
              {/* Trust indicators */}
              <div className="flex items-center gap-4 text-xs text-[#D6D1CA]">
                <div className="flex items-center gap-1">
                  <Shield size={14} className="text-[#4E7C63]" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={14} className="text-[#4E7C63]" />
                  <span>Student Only</span>
                </div>
              </div>
            </div>

            {/* Column 2 - Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Marketplace</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => handleTabSwitch('marketplace')}
                    className="text-[#D6D1CA] hover:text-[#B86B3E] transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-[#5A5A5A] rounded-full group-hover:bg-[#B86B3E] transition-colors"></span>
                    Browse All Items
                  </button>
                </li>
                <li>
                  <button
                    onClick={handlePostItem}
                    className="text-[#D6D1CA] hover:text-[#B86B3E] transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full group-hover:bg-[#B86B3E] transition-colors"></span>
                    Sell an Item
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabSwitch('my-listings')}
                    className="text-slate-400 hover:text-[#B86B3E] transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full group-hover:bg-[#B86B3E] transition-colors"></span>
                    My Listings
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3 - Support */}
            <div>
              <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Support</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => handleTabSwitch('about')}
                    className="text-slate-400 hover:text-[#B86B3E] transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full group-hover:bg-[#B86B3E] transition-colors"></span>
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabSwitch('about')}
                    className="text-slate-400 hover:text-[#B86B3E] transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full group-hover:bg-[#B86B3E] transition-colors"></span>
                    Safety Tips
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabSwitch('about')}
                    className="text-slate-400 hover:text-[#B86B3E] transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full group-hover:bg-[#B86B3E] transition-colors"></span>
                    Help Center
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4 - Connect */}
            <div>
              <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Connect With Us</h3>
              <p className="text-slate-400 text-sm mb-4">Follow us for updates and tips</p>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.instagram.com/e_sokostore/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 bg-slate-700/50 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 rounded-xl transition-all duration-300 group"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Border with Copyright */}
          <div className="border-t border-slate-700/50 mt-12 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-slate-500 text-sm">
                © {new Date().getFullYear()} E-Soko. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <button className="hover:text-[#B86B3E] transition-colors">Privacy Policy</button>
                <button className="hover:text-[#B86B3E] transition-colors">Terms of Service</button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default App
