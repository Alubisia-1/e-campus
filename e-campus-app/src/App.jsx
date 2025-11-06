import React, { useState, useEffect } from 'react'
import { Store, ShoppingBag, Menu, X, Plus, Search, Book, Laptop, Sofa, Shirt, ChevronDown, ChevronLeft, ChevronRight, MessageCircle, Phone, Mail, Instagram, Facebook, Twitter, Upload, DollarSign, Trash2, LogOut, User } from 'lucide-react'
import { api } from './services/api'
import ContactReveal from './components/ContactReveal'
import LocalContactReveal from './components/LocalContactReveal'
import AuthModal from './components/AuthModal'
import Toast from './components/Toast'
import AdManager from './components/AdManager'
import SponsoredBadge from './components/SponsoredBadge'

function App() {
  // State management
  const [activeTab, setActiveTab] = useState('marketplace')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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

  // Device ID for ownership tracking
  const [deviceId, setDeviceId] = useState(null)

  // Authentication state
  const [user, setUser] = useState(null)
  const [authToken, setAuthToken] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login')
  const [authModalMessage, setAuthModalMessage] = useState('')

  // Toast notification state
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
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
    nativeAdFrequency: 4,
    // How often to show sidebar ads on mobile (every X products)
    sidebarAdFrequency: 6,
    // Starting position for first ad (to avoid showing ad immediately)
    firstAdPosition: 3,
    // Maximum ads to show (to prevent oversaturation)
    maxAdsPerPage: 10
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

    // Check if admin is logged in
    const adminStatus = localStorage.getItem('isAdmin')
    if (adminStatus === 'true') {
      setIsAdmin(true)
    }

    // Load auth token and user from localStorage
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      setAuthToken(storedToken)
      setUser(JSON.parse(storedUser))
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
        localStorage.setItem('isAdmin', 'true')
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

  // Handle admin logout
  const handleAdminLogout = () => {
    setIsAdmin(false)
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('adminToken')
    setActiveTab('marketplace')
    alert('Admin logged out')
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

    // If 7 taps reached, open admin login
    if (newCount === 7) {
      setLogoTapCount(0)
      clearTimeout(newTimer)
      if (!isAdmin) {
        setShowAdminLogin(true)
        showToast('Admin portal unlocked! 🔓', 'info')
      } else {
        showToast('Already logged in as admin', 'info')
      }
    }
    // Give feedback at 4 taps (halfway)
    else if (newCount === 4) {
      showToast('Keep tapping... 👆', 'info')
    }
  }

  // Authentication handler
  const handleAuthSuccess = (userData, token) => {
    setUser(userData)
    setAuthToken(token)
  }

  const handleLogout = () => {
    setUser(null)
    setAuthToken(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setActiveTab('marketplace')
    alert('Logged out successfully')
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
        setSelectedProduct(null)
        setCurrentImageIndex(0)
      } else if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
        setCurrentImageIndex(currentImageIndex - 1)
      } else if (e.key === 'ArrowRight' && currentImageIndex < selectedProduct.images.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedProduct, currentImageIndex])

  // Test API connection and fetch data on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Test connection
        const healthResponse = await api.healthCheck()
        console.log('Backend connection successful:', healthResponse)
        setApiConnected(true)

        // Fetch data if connected
        const [categoriesResponse, productsResponse] = await Promise.all([
          api.getCategories(),
          api.getProducts()
        ])

        console.log('Categories loaded:', categoriesResponse)
        console.log('Products loaded:', productsResponse)

        setCategories(categoriesResponse.data || [])

        // Use only API products (no more localStorage)
        const apiProducts = productsResponse.data?.products || []
        setProducts(apiProducts)

      } catch (error) {
        console.error('Failed to connect to backend or fetch data:', error)
        setApiConnected(false)
        // Show empty state - no fallback data
        setCategories([])
        setProducts([])
      } finally {
        setLoading(false)
        setDataLoading(false)
      }
    }

    initializeApp()
  }, [])

  // No more static data - clean professional site

  const handleShopNowClick = () => {
    setActiveTab('official-store')
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleTabSwitch = (tab) => {
    setActiveTab(tab)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Delete item handler using backend API
  const handleDeleteItem = async (productId) => {
    if (!authToken || !user) {
      showToast('Please login to delete items', 'error')
      setShowAuthModal(true)
      return
    }

    console.log('Attempting to delete product:', productId)

    const confirmMessage = isAdmin
      ? 'Admin: Are you sure you want to delete this listing?'
      : 'Are you sure you want to delete this listing? This action cannot be undone.'

    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      // Call backend API to delete product
      const response = await api.deleteProduct(productId, authToken)

      if (response.status === 'success') {
        // Update state (removes from display immediately)
        setProducts(prevProducts => prevProducts.filter(p => p._id !== productId))
        setMyListings(prevListings => prevListings.filter(p => p._id !== productId))

        showToast('Listing deleted successfully!', 'success')
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
      showToast('Failed to delete listing. Please try again.', 'error')
    }
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
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setShowSearchResults(true)

    // Search through all products (backend + localStorage)
    const query = searchQuery.toLowerCase().trim()

    const results = products.filter(product => {
      // Search in title
      if (product.title?.toLowerCase().includes(query)) return true

      // Search in description
      if (product.description?.toLowerCase().includes(query)) return true

      // Search in category name
      if (product.category?.name?.toLowerCase().includes(query)) return true

      // Search in condition
      if (product.condition?.toLowerCase().includes(query)) return true

      // Search in price (convert to string)
      if (product.price?.toString().includes(query)) return true

      return false
    })

    setSearchResults(results)
    setIsSearching(false)
  }

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value)
    if (!e.target.value.trim()) {
      setShowSearchResults(false)
      setSearchResults([])
    }
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
        // Refresh products list
        setUploadProgress('Refreshing listings...')
        const productsResponse = await api.getProducts()
        if (productsResponse.status === 'success') {
          setProducts(productsResponse.data.products)
        }

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

  const getFilteredProducts = () => {
    if (!selectedCategory) {
      return products
    }
    return products.filter(product =>
      product.category?._id === selectedCategory || product.category?.id === selectedCategory
    )
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
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Tap 7 times for admin access */}
            <div
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={handleLogoTap}
              title="E-Soko"
            >
              <ShoppingBag className="text-blue-600" size={28} />
              <span className="text-xl font-bold text-gray-900">E-Soko</span>
              {/* API Connection Status */}
              {!loading && (
                <div className={`ml-2 w-2 h-2 rounded-full ${apiConnected ? 'bg-green-500' : 'bg-red-500'}`}
                     title={apiConnected ? 'Connected to backend' : 'Backend connection failed'} />
              )}
              {isAdmin && (
                <span className="ml-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  ADMIN
                </span>
              )}
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => handleTabSwitch('marketplace')}
                className={`font-medium transition-colors duration-200 ${
                  activeTab === 'marketplace'
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Marketplace
              </button>

              <button
                onClick={() => handleTabSwitch('official-store')}
                className={`font-medium transition-colors duration-200 ${
                  activeTab === 'official-store'
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Official Store
              </button>

              <button
                onClick={() => handleTabSwitch('my-listings')}
                className={`font-medium transition-colors duration-200 ${
                  activeTab === 'my-listings'
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                My Listings
              </button>

              <button
                onClick={() => handleTabSwitch('about')}
                className={`font-medium transition-colors duration-200 ${
                  activeTab === 'about'
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                About Us
              </button>

              {isAdmin && (
                <button
                  onClick={() => handleTabSwitch('ad-manager')}
                  className={`font-medium transition-colors duration-200 ${
                    activeTab === 'ad-manager'
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Ad Manager
                </button>
              )}

              <button
                onClick={handlePostItem}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus size={20} />
                Post Item
              </button>

              {/* User Menu - Show logout only when logged in */}
              {user && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700">Hi, <span className="font-semibold">{user.username}</span></span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}

              {/* Admin Login/Logout - Only visible when logged in */}
              {isAdmin && (
                <button
                  onClick={handleAdminLogout}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                >
                  Admin Logout
                </button>
              )}
            </div>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-700 hover:text-blue-600 transition-colors"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Mobile Menu Sidebar */}
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Sidebar */}
              <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out">
                <div className="flex flex-col h-full">
                  {/* Sidebar Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="text-blue-600" size={24} />
                      <span className="font-bold text-gray-900">Menu</span>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Sidebar Content */}
                  <div className="flex-1 overflow-y-auto py-4">
                    <div className="flex flex-col gap-2 px-4">
                      <button
                        onClick={() => {
                          handleTabSwitch('marketplace')
                          setMobileMenuOpen(false)
                        }}
                        className={`text-left font-medium py-3 px-4 rounded-lg transition-colors duration-200 ${
                          activeTab === 'marketplace'
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Marketplace
                      </button>

                      <button
                        onClick={() => {
                          handleTabSwitch('official-store')
                          setMobileMenuOpen(false)
                        }}
                        className={`text-left font-medium py-3 px-4 rounded-lg transition-colors duration-200 ${
                          activeTab === 'official-store'
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Official Store
                      </button>

                      <button
                        onClick={() => {
                          handleTabSwitch('my-listings')
                          setMobileMenuOpen(false)
                        }}
                        className={`text-left font-medium py-3 px-4 rounded-lg transition-colors duration-200 ${
                          activeTab === 'my-listings'
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        My Listings
                      </button>

                      <button
                        onClick={() => {
                          handleTabSwitch('about')
                          setMobileMenuOpen(false)
                        }}
                        className={`text-left font-medium py-3 px-4 rounded-lg transition-colors duration-200 ${
                          activeTab === 'about'
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        About Us
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            handleTabSwitch('ad-manager')
                            setMobileMenuOpen(false)
                          }}
                          className={`text-left font-medium py-3 px-4 rounded-lg transition-colors duration-200 ${
                            activeTab === 'ad-manager'
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Ad Manager
                        </button>
                      )}

                      <div className="border-t my-4"></div>

                      <button
                        onClick={() => {
                          handlePostItem()
                          setMobileMenuOpen(false)
                        }}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium w-full"
                      >
                        <Plus size={20} />
                        Post Item
                      </button>

                      {/* Mobile User Menu */}
                      {user && (
                        <>
                          <div className="border-t my-4"></div>
                          <div className="flex flex-col gap-2">
                            <div className="text-sm text-gray-600 px-4 py-2">
                              Hi, <span className="font-semibold text-gray-900">{user.username}</span>
                            </div>
                            <button
                              onClick={() => {
                                handleLogout()
                                setMobileMenuOpen(false)
                              }}
                              className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium w-full"
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

      {/* Hero Section */}
      {activeTab === 'marketplace' && (
        <section className="bg-gradient-blue py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Your Campus Marketplace
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Buy and sell with fellow students. Easy. Local. Trusted.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex items-center bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto">
              <div className="pl-4 text-gray-400">
                <Search size={24} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search for textbooks, electronics, furniture..."
                className="flex-1 px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'marketplace' && (
          <>
            <div>
              {/* Main Content Column */}
              <div>
              {/* Search Results */}
              {showSearchResults && (
                <section className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Search Results for "{searchQuery}"
                    </h2>
                    <button
                      onClick={() => setShowSearchResults(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {isSearching ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Searching...</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-lg">No items found for "{searchQuery}"</p>
                      <p className="text-gray-400 text-sm mt-2">Try using different keywords or browse by category</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {searchResults.map((item, index) => (
                        <div
                          key={`search-result-${item._id}-${index}`}
                          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => setSelectedProduct(item)}
                        >
                          <img
                            src={item.images?.[0]?.url || 'https://via.placeholder.com/300x200'}
                            alt={item.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">{item.title}</h3>
                              {item.sponsored?.isSponsored && <SponsoredBadge size="small" variant="default" />}
                            </div>
                            <p className="text-2xl font-bold text-blue-600 mb-2">KES {item.price}</p>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span className="bg-gray-100 px-2 py-1 rounded">{item.condition}</span>
                              <span>{item.category?.name}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Browse by Category */}
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Browse by Category</h2>
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>

                {selectedCategory && (
                  <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{categories.find(cat => cat._id === selectedCategory)?.icon || '📦'}</span>
                      <div className="flex-1">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">Filtering by:</span> {categories.find(cat => cat._id === selectedCategory)?.name || 'Category'}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Showing {getFilteredProducts().length} {getFilteredProducts().length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {dataLoading ? (
                    // Loading skeleton
                    Array.from({ length: 4 }).map((_, index) => (
                      <div key={`category-skeleton-${index}`} className="bg-white rounded-lg p-6 text-center border border-gray-200 animate-pulse">
                        <div className="bg-gray-200 rounded-full w-12 h-12 mx-auto mb-3"></div>
                        <div className="bg-gray-200 h-4 rounded mb-2"></div>
                        <div className="bg-gray-200 h-3 rounded w-16 mx-auto"></div>
                      </div>
                    ))
                  ) : (
                    getMappedCategories().map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className={`rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 border-2 ${
                          selectedCategory === category.id
                            ? 'bg-blue-50 border-blue-500 shadow-lg transform scale-105'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-center mb-3">
                          <span className="text-4xl">{category.icon}</span>
                        </div>
                        <h3 className={`font-semibold mb-1 ${
                          selectedCategory === category.id ? 'text-blue-700' : 'text-gray-900'
                        }`}>{category.name}</h3>
                        <p className={`text-sm ${
                          selectedCategory === category.id ? 'text-blue-600 font-medium' : 'text-gray-500'
                        }`}>{category.itemCount} items</p>
                      </button>
                    ))
                  )}
                </div>
              </section>

            {/* Featured Official Store Banner - Professional */}
            <section className="mb-12 bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 rounded-xl shadow-xl overflow-hidden">
              <div className="relative p-8 md:p-10">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 20px 20px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                  }}></div>
                </div>

                {/* Content */}
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 text-white">
                  <div className="flex items-center gap-4 flex-1">
                    <Store className="text-white hidden md:block" size={48} />
                    <div className="text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <h2 className="text-2xl md:text-3xl font-bold">Official E-Soko Store</h2>
                        <span className="bg-white bg-opacity-20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-bold">
                          OFFICIAL
                        </span>
                      </div>
                      <p className="text-white text-opacity-95 text-base md:text-lg">
                        Premium campus merchandise and verified products - Coming Soon!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleShopNowClick}
                    className="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all shadow-lg whitespace-nowrap"
                  >
                    Learn More →
                  </button>
                </div>
              </div>
            </section>

            {/* Recent Listings Section */}
            <section id="product-listings">
              {/* Header with Sort */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {selectedCategory
                        ? `${categories.find(cat => cat._id === selectedCategory)?.name || 'Category'} Items`
                        : 'Recent Listings'
                      }
                    </h2>
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                      {getFilteredProducts().length} {getFilteredProducts().length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-2 flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      ← Show all items
                    </button>
                  )}
                </div>
                <div className="relative">
                  <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                    <option>Sort by: Recent</option>
                    <option>Sort by: Price Low to High</option>
                    <option>Sort by: Price High to Low</option>
                    <option>Sort by: Popular</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Empty State for Category with No Items */}
              {selectedCategory && getFilteredProducts().length === 0 ? (
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
                <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200">
                  <div className="text-7xl mb-6">🛍️</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Welcome to E-Soko Marketplace!
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto text-lg">
                    No items listed yet. Be the first to share what you're selling with the campus community!
                  </p>
                  <button
                    onClick={handlePostItem}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
                  >
                    <Plus size={20} />
                    List Your First Item
                  </button>
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl mb-2">📸</div>
                      <p className="text-sm font-medium text-gray-700">Upload Photos</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl mb-2">💰</div>
                      <p className="text-sm font-medium text-gray-700">Set Your Price</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl mb-2">🤝</div>
                      <p className="text-sm font-medium text-gray-700">Connect with Buyers</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Listings Grid with Integrated Ads */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getMappedProducts().map((item, index) => {
                      // Smart Native Ad Rotation Algorithm
                      // Shows ads starting from firstAdPosition, then every nativeAdFrequency products
                      // Rotates through all available native ads using modulo
                      const shouldShowNativeAd = nativeAds.length > 0 && index >= AD_CONFIG.firstAdPosition &&
                                                   (index - AD_CONFIG.firstAdPosition) % AD_CONFIG.nativeAdFrequency === 0
                      const nativeAdRotationIndex = Math.floor((index - AD_CONFIG.firstAdPosition) / AD_CONFIG.nativeAdFrequency)
                      const nativeAdToShow = nativeAds.length > 0 ? nativeAdRotationIndex % nativeAds.length : 0
                      const showNativeAd = shouldShowNativeAd && nativeAdRotationIndex < AD_CONFIG.maxAdsPerPage && nativeAds.length > 0

                      // Smart Sidebar Ad Rotation Algorithm for Mobile
                      // Shows ads at strategic intervals, rotating through all available sidebar ads
                      const shouldShowSidebarAd = sidebarAds.length > 0 && index >= AD_CONFIG.firstAdPosition &&
                                                    (index - AD_CONFIG.firstAdPosition) % AD_CONFIG.sidebarAdFrequency === 0
                      const sidebarAdRotationIndex = Math.floor((index - AD_CONFIG.firstAdPosition) / AD_CONFIG.sidebarAdFrequency)
                      const sidebarAdToShow = sidebarAds.length > 0 ? sidebarAdRotationIndex % sidebarAds.length : 0
                      const showSidebarAd = shouldShowSidebarAd && sidebarAdRotationIndex < AD_CONFIG.maxAdsPerPage && sidebarAds.length > 0

                      return (
                        <React.Fragment key={`item-${item.id}-${index}`}>
                          {/* Native Ads - Show on all devices with rotation */}
                          {showNativeAd && (
                            <div
                              key={`native-ad-${nativeAds[nativeAdToShow].id}-${index}`}
                              className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
                            >
                              <div className="flex items-start gap-4">
                                <div className="text-5xl">{nativeAds[nativeAdToShow].image}</div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded font-semibold">
                                      SPONSORED
                                    </span>
                                  </div>
                                  <h3 className="font-bold text-gray-900 mb-2">
                                    {nativeAds[nativeAdToShow].title}
                                  </h3>
                                  <p className="text-gray-600 text-sm mb-4">
                                    {nativeAds[nativeAdToShow].description}
                                  </p>
                                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                                    {nativeAds[nativeAdToShow].cta}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Sidebar Ads - Show only on mobile between products with rotation */}
                          {showSidebarAd && (
                            <div
                              key={`sidebar-ad-${sidebarAds[sidebarAdToShow].id}-${index}`}
                              className="lg:hidden bg-gradient-to-r rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                              onClick={sidebarAds[sidebarAdToShow].onClick}
                            >
                              <div className={`bg-gradient-to-r ${sidebarAds[sidebarAdToShow].gradient} rounded-xl p-4`}>
                                <div className="flex items-start gap-4">
                                  <div className="text-5xl flex-shrink-0">{sidebarAds[sidebarAdToShow].icon}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                      <span className="bg-white bg-opacity-90 text-xs px-2 py-1 rounded-full font-bold"
                                            style={{
                                              color: sidebarAds[sidebarAdToShow].gradient.includes('orange') ? '#ea580c' :
                                                     sidebarAds[sidebarAdToShow].gradient.includes('purple') ? '#9333ea' :
                                                     sidebarAds[sidebarAdToShow].gradient.includes('green') ? '#16a34a' :
                                                     sidebarAds[sidebarAdToShow].gradient.includes('pink') ? '#db2777' :
                                                     sidebarAds[sidebarAdToShow].gradient.includes('blue') ? '#2563eb' :
                                                     sidebarAds[sidebarAdToShow].gradient.includes('red') ? '#dc2626' :
                                                     sidebarAds[sidebarAdToShow].gradient.includes('teal') ? '#0d9488' :
                                                     sidebarAds[sidebarAdToShow].gradient.includes('indigo') ? '#4f46e5' : '#16a34a'
                                            }}>
                                        {sidebarAds[sidebarAdToShow].badge}
                                      </span>
                                    </div>
                                    <h3 className={`text-xl font-bold mb-2 ${sidebarAds[sidebarAdToShow].textColor}`}>
                                      {sidebarAds[sidebarAdToShow].title}
                                    </h3>
                                    <p className={`text-sm mb-3 ${sidebarAds[sidebarAdToShow].textColor} opacity-90`}>
                                      {sidebarAds[sidebarAdToShow].description}
                                    </p>
                                    <button
                                      className={`${sidebarAds[sidebarAdToShow].ctaClass} px-5 py-2 rounded-lg text-sm font-semibold transition-colors`}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (sidebarAds[sidebarAdToShow].onClick) {
                                          sidebarAds[sidebarAdToShow].onClick()
                                        }
                                      }}
                                    >
                                      {sidebarAds[sidebarAdToShow].cta}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Product Card */}
                          <div
                            onClick={() => setSelectedProduct(item)}
                            className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                          >
                            {/* Image Area */}
                            <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-48 flex items-center justify-center overflow-hidden">
                              {item.images[0]?.startsWith('data:') || item.images[0]?.startsWith('http') ? (
                                <img
                                  src={item.images[0]}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    e.target.nextSibling.style.display = 'flex'
                                  }}
                                />
                              ) : null}
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ display: item.images[0]?.startsWith('data:') || item.images[0]?.startsWith('http') ? 'none' : 'flex' }}
                              >
                                <span className="text-7xl">{item.images[0] || '📦'}</span>
                              </div>
                              {item.images.length > 1 && (
                                <span className="absolute top-3 right-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                  +{item.images.length - 1} more
                                </span>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 text-lg">
                                    {item.title}
                                  </h3>
                                  {item.sponsored?.isSponsored && (
                                    <div className="mt-1">
                                      <SponsoredBadge size="small" variant="default" />
                                    </div>
                                  )}
                                </div>
                                <span className="text-blue-600 font-bold text-xl ml-2">
                                  KES {item.price.toLocaleString()}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                  {item.category}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                  item.condition === 'Like New' || item.condition === 'Excellent'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {item.condition}
                                </span>
                              </div>

                              <div className="flex gap-2">
                                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors">
                                  View Details
                                </button>
                                {isAdmin && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteItem(item._id)
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
                                    title="Admin: Delete this item"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                )}
                              </div>
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

          </div>
          </>
        )}
        {activeTab === 'official-store' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Professional Banner - Coming Soon */}
            <section className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-2xl shadow-2xl overflow-hidden mb-12">
              <div className="relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 20px 20px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                  }}></div>
                </div>

                {/* Content */}
                <div className="relative px-8 py-16 md:px-16 md:py-24 text-center text-white">
                  {/* Badge */}
                  <div className="flex justify-center mb-6">
                    <span className="inline-flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-40 text-white text-sm font-bold px-6 py-2 rounded-full">
                      <Store size={18} />
                      OFFICIAL PARTNER
                    </span>
                  </div>

                  {/* Heading */}
                  <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
                    E-Soko Official Store
                  </h1>

                  {/* Description */}
                  <p className="text-xl md:text-2xl text-white text-opacity-95 mb-8 max-w-3xl mx-auto leading-relaxed">
                    Premium quality merchandise and exclusive campus gear. Coming soon to serve you better!
                  </p>

                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
                    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                      <div className="text-4xl mb-3">✓</div>
                      <h3 className="font-bold text-lg mb-2">Verified Quality</h3>
                      <p className="text-sm text-white text-opacity-90">100% authentic products with warranty</p>
                    </div>
                    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                      <div className="text-4xl mb-3">🚚</div>
                      <h3 className="font-bold text-lg mb-2">Fast Delivery</h3>
                      <p className="text-sm text-white text-opacity-90">Quick campus delivery available</p>
                    </div>
                    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                      <div className="text-4xl mb-3">💳</div>
                      <h3 className="font-bold text-lg mb-2">Secure Payment</h3>
                      <p className="text-sm text-white text-opacity-90">Safe and easy payment options</p>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="mt-12">
                    <p className="text-lg text-white text-opacity-90 mb-4">
                      Want to feature your products here?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a
                        href="mailto:partner@e-soko.com"
                        className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-lg hover:bg-opacity-90 transition-all font-bold text-lg shadow-lg hover:shadow-xl"
                      >
                        <Mail size={20} />
                        Partner With Us
                      </a>
                      <button
                        onClick={() => setActiveTab('marketplace')}
                        className="inline-flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-opacity-30 transition-all font-bold text-lg"
                      >
                        <ShoppingBag size={20} />
                        Browse Marketplace
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Info Section */}
            <section className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                  About Our Official Store
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p className="text-lg">
                    The E-Soko Official Store is your trusted source for premium campus merchandise,
                    verified products, and exclusive deals from our partner brands.
                  </p>
                  <p className="text-lg">
                    We're currently setting up our catalog to bring you the best selection of:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 my-6">
                    <li className="flex items-center gap-3">
                      <span className="text-2xl">📚</span>
                      <span className="font-medium">Textbooks & Study Materials</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-2xl">💻</span>
                      <span className="font-medium">Electronics & Gadgets</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-2xl">👕</span>
                      <span className="font-medium">Campus Apparel & Gear</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-2xl">🎒</span>
                      <span className="font-medium">Accessories & Supplies</span>
                    </li>
                  </ul>
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg mt-8">
                    <p className="text-orange-900 font-medium">
                      <strong>Stay tuned!</strong> We're launching soon with exclusive deals and verified products just for you.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* My Listings Tab */}
        {activeTab === 'my-listings' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Listings</h1>
              <p className="text-gray-600">Manage your posted items</p>
            </div>

            {/* Check if user is logged in */}
            {!authToken || !user ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Login Required
                </h3>
                <p className="text-gray-600 mb-6">
                  Please login or register to view your listings
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <User size={20} />
                  Login / Register
                </button>
              </div>
            ) : myListingsLoading ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-gray-600">Loading your listings...</p>
              </div>
            ) : getMyListings().length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No listings yet
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't posted any items for sale yet.
                </p>
                <button
                  onClick={handlePostItem}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus size={20} />
                  Post Your First Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getMyListings().map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                  >
                    {/* Image */}
                    <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-48 flex items-center justify-center overflow-hidden">
                      {item.images[0]?.url?.startsWith('data:') || item.images[0]?.url?.startsWith('http') ? (
                        <img
                          src={item.images[0].url}
                          alt={item.title}
                          className="w-full h-full object-cover"
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
                  <p className="text-lg"><strong>Email:</strong> <a href="mailto:support@ecampus.com" className="text-blue-600 hover:underline">support@ecampus.com</a></p>
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
          <AdManager authToken={authToken} />
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
            }
          }}
        >
          <div className="bg-white rounded-xl max-w-5xl w-full my-4 sm:my-8 relative max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedProduct(null)
                setCurrentImageIndex(0)
              }}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
            >
              <X size={24} className="text-gray-700" />
            </button>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 p-4 sm:p-6 md:p-8">
              {/* Left Column - Image Gallery */}
              <div className="space-y-4">
                {/* Main Image Display */}
                <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-64 sm:h-80 md:h-96 flex items-center justify-center overflow-hidden">
                  {(() => {
                    // Handle both 'image' (official store) and 'images' (marketplace) formats
                    const currentImage = selectedProduct.images?.[currentImageIndex] || selectedProduct.image
                    const isImageUrl = currentImage?.startsWith('data:') || currentImage?.startsWith('http')

                    return isImageUrl ? (
                      <img
                        src={currentImage}
                        alt={`${selectedProduct.title} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-contain"
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

                {/* Delete button removed - Official store items managed separately */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Item Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Post New Item</h2>
                <button
                  onClick={handleClosePostModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmitPost} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={postFormData.title}
                    onChange={(e) => handlePostFormChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., iPhone 13 Pro - Like New"
                    maxLength={100}
                    required
                  />
                  <p className={`text-xs mt-1 ${postFormData.title.length < 5 ? 'text-red-500' : 'text-gray-500'}`}>
                    {postFormData.title.length}/100 characters (minimum 5)
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={postFormData.description}
                    onChange={(e) => handlePostFormChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your item in detail..."
                    maxLength={2000}
                    required
                  />
                  <p className={`text-xs mt-1 ${postFormData.description.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                    {postFormData.description.length}/2000 characters (minimum 10)
                  </p>
                </div>

                {/* Price and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price * (KES)
                    </label>
                    <div className="relative">
                      <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={postFormData.price}
                        onChange={(e) => handlePostFormChange('price', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1000"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={postFormData.category}
                      onChange={(e) => handlePostFormChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Condition and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition
                    </label>
                    <select
                      value={postFormData.condition}
                      onChange={(e) => handlePostFormChange('condition', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="New">New</option>
                      <option value="Like New">Like New</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campus/Location
                    </label>
                    <input
                      type="text"
                      value={postFormData.location.campus}
                      onChange={(e) => handlePostFormChange('location.campus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Main Campus"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={postFormData.contact.phone}
                        onChange={(e) => handlePostFormChange('contact.phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., +1234567890"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Buyers will use this to contact you</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={postFormData.contact.email}
                        onChange={(e) => handlePostFormChange('contact.email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., seller@email.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">Alternative contact method</p>
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Images * (Up to 3 images)
                  </label>

                  {/* Image Previews */}
                  {imagePreviewUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Area */}
                  {selectedImages.length < 3 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500 text-sm">
                          Click to upload images (JPG, PNG, WebP)
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Max 5MB per image • {3 - selectedImages.length} remaining
                        </p>
                      </label>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleClosePostModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                    disabled={isSubmittingPost}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmittingPost}
                  >
                    {isSubmittingPost ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {uploadProgress || 'Posting...'}
                      </span>
                    ) : 'Post Item'}
                  </button>
                </div>
              </form>
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
        }}
        onAuthSuccess={(userData, token) => {
          setUser(userData)
          setAuthToken(token)
          setAuthModalMode('login')
          setAuthModalMessage('')
        }}
        initialMode={authModalMode}
        message={authModalMessage}
      />

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1 - Logo and Tagline */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="text-blue-400" size={32} />
                <span className="text-xl font-bold text-white">E-Soko</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your trusted marketplace. Buy and sell with fellow students safely and easily.
              </p>
            </div>

            {/* Column 2 - Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleTabSwitch('about')}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabSwitch('about')}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Safety Tips
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3 - Support */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleTabSwitch('about')}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Help Center
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabSwitch('about')}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Contact Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabSwitch('about')}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Report Issue
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4 - Connect */}
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/e_sokostore/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram size={20} className="text-gray-300" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Border with Copyright */}
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} E-Soko. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

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
