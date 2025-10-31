import React, { useState, useEffect } from 'react'
import { Store, ShoppingBag, Menu, X, Plus, Search, Book, Laptop, Sofa, Shirt, ChevronDown, ChevronLeft, ChevronRight, MessageCircle, Phone, Mail, Instagram, Facebook, Twitter, Upload, DollarSign, Trash2, LogOut, User } from 'lucide-react'
import { api } from './services/api'
import ContactReveal from './components/ContactReveal'
import LocalContactReveal from './components/LocalContactReveal'
import AuthModal from './components/AuthModal'
import Toast from './components/Toast'

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
  const [showOfficialStoreModal, setShowOfficialStoreModal] = useState(false)
  const [officialStoreFormData, setOfficialStoreFormData] = useState({
    title: '',
    description: '',
    price: '',
    image: '',
    link: '',
    contactEmail: '',
    contactPhone: ''
  })

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
  const handleAdminLogin = (e) => {
    e.preventDefault()
    // Simple password check (in production, use proper authentication)
    if (adminPassword === 'admin123') {
      setIsAdmin(true)
      localStorage.setItem('isAdmin', 'true')
      setShowAdminLogin(false)
      setAdminPassword('')
      alert('Admin access granted!')
    } else {
      alert('Incorrect password!')
      setAdminPassword('')
    }
  }

  // Handle admin logout
  const handleAdminLogout = () => {
    setIsAdmin(false)
    localStorage.removeItem('isAdmin')
    setActiveTab('marketplace')
    alert('Admin logged out')
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

  // Handle official store item addition (Admin only)
  const handleAddOfficialStoreItem = () => {
    if (!isAdmin) {
      alert('Only admins can add official store items')
      return
    }
    setShowOfficialStoreModal(true)
  }

  const handleOfficialStoreSubmit = (e) => {
    e.preventDefault()

    // Get existing official store items
    const existingItems = JSON.parse(localStorage.getItem('officialStoreItems') || '[]')

    // Create new official store item
    const newItem = {
      id: `official_${Date.now()}`,
      ...officialStoreFormData,
      addedBy: 'admin',
      createdAt: new Date().toISOString()
    }

    // Save to localStorage
    const updatedItems = [...existingItems, newItem]
    localStorage.setItem('officialStoreItems', JSON.stringify(updatedItems))

    // Reset form and close modal
    setOfficialStoreFormData({
      title: '',
      description: '',
      price: '',
      image: '',
      link: '',
      contactEmail: '',
      contactPhone: ''
    })
    setShowOfficialStoreModal(false)

    alert('Official store item added successfully!')
  }

  // Handle official store item deletion (Admin only)
  const handleDeleteOfficialStoreItem = (itemId) => {
    if (!isAdmin) {
      alert('Only admins can delete official store items')
      return
    }

    // Check if it's a static item (cannot be deleted)
    const isStaticItem = storeItemsStatic.some(item => item.id === itemId)
    if (isStaticItem) {
      alert('Cannot delete default official store items. Only custom items can be deleted.')
      return
    }

    if (confirm('Are you sure you want to delete this official store item?')) {
      const existingItems = JSON.parse(localStorage.getItem('officialStoreItems') || '[]')
      const updatedItems = existingItems.filter(item => item.id !== itemId)
      localStorage.setItem('officialStoreItems', JSON.stringify(updatedItems))
      alert('Official store item deleted successfully!')

      // Close modal if the deleted item is currently selected
      if (selectedProduct && selectedProduct.id === itemId) {
        setSelectedProduct(null)
      }
    }
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
        // Fall back to static data if API fails
        setCategories(staticCategories)
        setProducts(staticProducts)
      } finally {
        setLoading(false)
        setDataLoading(false)
      }
    }

    initializeApp()
  }, [])

  // Static fallback data - Categories
  const staticCategories = [
    { _id: 1, name: 'Textbooks', icon: '📚', productCount: 45 },
    { _id: 2, name: 'Electronics', icon: '💻', productCount: 32 },
    { _id: 3, name: 'Furniture', icon: '🪑', productCount: 28 },
    { _id: 4, name: 'Fashion', icon: '👕', productCount: 56 }
  ]

  // Static fallback data - Marketplace Items (with proper category structure)
  const staticProducts = [
    {
      _id: 'static_1',
      id: 1,
      title: 'Calculus Textbook - 10th Edition',
      price: 6750,
      category: { _id: 1, name: 'Textbooks', icon: '📚' },
      seller: {
        _id: 'seller_1',
        name: 'Sarah M.',
        phone: '+1234567890',
        email: 'sarah.m@campus.edu',
        whatsapp: '+1234567890'
      },
      images: [
        { url: '📚', publicId: 'static_1_0', _id: 'img_static_1_0' },
        { url: '📖', publicId: 'static_1_1', _id: 'img_static_1_1' },
        { url: '📕', publicId: 'static_1_2', _id: 'img_static_1_2' }
      ],
      condition: 'Like New',
      description: 'Barely used calculus textbook. Only used for one semester. No highlighting or writing inside.'
    },
    {
      _id: 'static_2',
      id: 2,
      title: 'MacBook Pro 2020 - 13 inch',
      price: 134850,
      category: { _id: 2, name: 'Electronics', icon: '💻' },
      seller: {
        _id: 'seller_2',
        name: 'John D.',
        phone: '+1234567891',
        email: 'john.d@campus.edu',
        whatsapp: '+1234567891'
      },
      images: [
        { url: '💻', publicId: 'static_2_0', _id: 'img_static_2_0' },
        { url: '⌨️', publicId: 'static_2_1', _id: 'img_static_2_1' },
        { url: '🖥️', publicId: 'static_2_2', _id: 'img_static_2_2' }
      ],
      condition: 'Good',
      description: 'MacBook Pro 13" 2020 model. 8GB RAM, 256GB SSD. Works perfectly, minor scratches on body.'
    },
    {
      _id: 'static_3',
      id: 3,
      title: 'Mini Fridge - Compact',
      price: 11250,
      category: { _id: 3, name: 'Furniture', icon: '🪑' },
      seller: {
        _id: 'seller_3',
        name: 'Mike R.',
        phone: '+1234567892',
        email: 'mike.r@campus.edu',
        whatsapp: '+1234567892'
      },
      images: [
        { url: '🧊', publicId: 'static_3_0', _id: 'img_static_3_0' },
        { url: '❄️', publicId: 'static_3_1', _id: 'img_static_3_1' },
        { url: '🔌', publicId: 'static_3_2', _id: 'img_static_3_2' }
      ],
      condition: 'Excellent',
      description: 'Perfect for dorm room. Energy efficient, barely used. Moving out sale!'
    },
    {
      _id: 'static_4',
      id: 4,
      title: 'Nike Sneakers - Size 10',
      price: 9000,
      category: { _id: 4, name: 'Fashion', icon: '👕' },
      seller: {
        _id: 'seller_4',
        name: 'Emma L.',
        phone: '+1234567893',
        email: 'emma.l@campus.edu',
        whatsapp: '+1234567893'
      },
      images: [
        { url: '👟', publicId: 'static_4_0', _id: 'img_static_4_0' },
        { url: '👞', publicId: 'static_4_1', _id: 'img_static_4_1' },
        { url: '🏃', publicId: 'static_4_2', _id: 'img_static_4_2' }
      ],
      condition: 'Like New',
      description: 'Nike running shoes, size 10. Worn only twice. Original box included.'
    },
    {
      _id: 'static_5',
      id: 5,
      title: 'Study Desk - Wooden',
      price: 7500,
      category: { _id: 3, name: 'Furniture', icon: '🪑' },
      seller: {
        _id: 'seller_5',
        name: 'Alex P.',
        phone: '+1234567894',
        email: 'alex.p@campus.edu',
        whatsapp: '+1234567894'
      },
      images: [
        { url: '🪑', publicId: 'static_5_0', _id: 'img_static_5_0' },
        { url: '📝', publicId: 'static_5_1', _id: 'img_static_5_1' },
        { url: '🖊️', publicId: 'static_5_2', _id: 'img_static_5_2' }
      ],
      condition: 'Good',
      description: 'Solid wooden study desk with drawer. Perfect for studying. Disassembles for easy transport.'
    },
    {
      _id: 'static_6',
      id: 6,
      title: 'iPhone 12 - 128GB Blue',
      price: 67500,
      category: { _id: 2, name: 'Electronics', icon: '💻' },
      seller: {
        _id: 'seller_6',
        name: 'Lisa K.',
        phone: '+1234567895',
        email: 'lisa.k@campus.edu',
        whatsapp: '+1234567895'
      },
      images: [
        { url: '📱', publicId: 'static_6_0', _id: 'img_static_6_0' },
        { url: '📲', publicId: 'static_6_1', _id: 'img_static_6_1' },
        { url: '☎️', publicId: 'static_6_2', _id: 'img_static_6_2' }
      ],
      condition: 'Excellent',
      description: 'iPhone 12 in blue, 128GB. Battery health 95%. Includes charger and case.'
    }
  ]

  // Get official store items (static + localStorage)
  const getOfficialStoreItems = () => {
    const localItems = JSON.parse(localStorage.getItem('officialStoreItems') || '[]')
    const staticItems = storeItemsStatic
    return [...localItems, ...staticItems]
  }

  // Sample Data - Official Store Items (Static)
  const storeItemsStatic = [
    {
      id: 101,
      title: 'Campus Hoodie',
      price: 4500,
      images: ['👕', '🧥', '👔'],
      description: 'Premium quality E-Campus branded hoodie. Available in multiple sizes.',
      badge: 'Official',
      sizes: ['S', 'M', 'L', 'XL'],
      contactEmail: 'store@yourdomain.edu',
      contactPhone: '+1234567890'
    },
    {
      id: 102,
      title: 'E-Campus Backpack',
      price: 6000,
      images: ['🎒', '🧳', '💼'],
      description: 'Durable backpack with laptop compartment. Perfect for daily campus use.',
      badge: 'Official',
      features: ['Laptop sleeve', 'Water resistant', 'Multiple pockets'],
      contactEmail: 'store@yourdomain.edu',
      contactPhone: '+1234567890'
    },
    {
      id: 103,
      title: 'Study Bundle Pack',
      price: 3750,
      images: ['📚', '✏️', '📓'],
      description: 'Complete study essentials: notebooks, pens, highlighters, and sticky notes.',
      badge: 'Official',
      includes: ['3 Notebooks', '5 Pens', '3 Highlighters', 'Sticky notes'],
      contactEmail: 'store@yourdomain.edu',
      contactPhone: '+1234567890'
    },
    {
      id: 104,
      title: 'Water Bottle',
      price: 2400,
      images: ['💧', '🚰', '♻️'],
      description: 'Eco-friendly stainless steel water bottle with E-Campus logo.',
      badge: 'Official',
      capacity: '750ml',
      contactEmail: 'store@yourdomain.edu',
      contactPhone: '+1234567890'
    }
  ]

  // Sample Data - Native Ads (Expandable array for multiple ads)
  const nativeAds = [
    {
      id: 'native-ad-1',
      type: 'sponsored',
      title: 'Get 20% Off Your First Order',
      description: 'Use code WELCOME20 at checkout. Valid for all official store items.',
      cta: 'Shop Now',
      image: '🎁'
    },
    {
      id: 'native-ad-2',
      type: 'sponsored',
      title: 'Student Discount Program',
      description: 'Sign up for our student rewards program and earn points on every purchase.',
      cta: 'Learn More',
      image: '🎓'
    },
    {
      id: 'native-ad-3',
      type: 'sponsored',
      title: 'Free Shipping This Week',
      description: 'All orders over KES 2,500 ship free. Limited time offer!',
      cta: 'Start Shopping',
      image: '🚚'
    },
    {
      id: 'native-ad-4',
      type: 'sponsored',
      title: 'Campus Book Exchange',
      description: 'Trade your old textbooks for new ones. Save up to 50% on course materials!',
      cta: 'Exchange Now',
      image: '📚'
    },
    {
      id: 'native-ad-5',
      type: 'sponsored',
      title: 'Tech Repair Services',
      description: 'Professional laptop & phone repairs. Student prices, same-day service.',
      cta: 'Get Quote',
      image: '🔧'
    },
    {
      id: 'native-ad-6',
      type: 'sponsored',
      title: 'Premium Tutoring',
      description: 'Struggling with coursework? Connect with top-rated student tutors.',
      cta: 'Find Tutor',
      image: '👨‍🏫'
    }
  ]

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

  // Sidebar promotional ads for mobile injection (Expandable array for multiple ads)
  const sidebarAds = [
    {
      id: 'sidebar-ad-1',
      type: 'promotion',
      title: 'E-Campus Merch',
      description: 'Exclusive campus merchandise. Show your school pride!',
      cta: 'Shop Now →',
      icon: '🛍️',
      gradient: 'from-orange-400 to-orange-500',
      textColor: 'text-white',
      ctaClass: 'bg-white text-orange-600 hover:bg-orange-50',
      badge: 'OFFICIAL',
      onClick: handleShopNowClick
    },
    {
      id: 'sidebar-ad-2',
      type: 'advertisement',
      title: 'Campus Gym',
      description: 'Get fit with our facilities. Student discount: 30% off!',
      cta: 'Learn More',
      icon: '💪',
      gradient: 'from-purple-400 to-purple-500',
      textColor: 'text-white',
      ctaClass: 'bg-white text-purple-600 hover:bg-purple-50',
      badge: 'AD'
    },
    {
      id: 'sidebar-ad-3',
      type: 'advertisement',
      title: 'Study Lounge',
      description: 'Quiet study spaces available 24/7. Reserve your spot today!',
      cta: 'Book Now',
      icon: '📚',
      gradient: 'from-green-400 to-green-500',
      textColor: 'text-white',
      ctaClass: 'bg-white text-green-600 hover:bg-green-50',
      badge: 'AD'
    },
    {
      id: 'sidebar-ad-4',
      type: 'advertisement',
      title: 'Campus Events',
      description: 'Don\'t miss out! Check upcoming events, concerts & activities.',
      cta: 'View Events',
      icon: '🎉',
      gradient: 'from-pink-400 to-pink-500',
      textColor: 'text-white',
      ctaClass: 'bg-white text-pink-600 hover:bg-pink-50',
      badge: 'AD'
    },
    {
      id: 'sidebar-ad-5',
      type: 'advertisement',
      title: 'Career Services',
      description: 'Resume building, interview prep & job placements for students.',
      cta: 'Get Started',
      icon: '💼',
      gradient: 'from-blue-400 to-blue-500',
      textColor: 'text-white',
      ctaClass: 'bg-white text-blue-600 hover:bg-blue-50',
      badge: 'AD'
    },
    {
      id: 'sidebar-ad-6',
      type: 'advertisement',
      title: 'Food Delivery',
      description: 'Hungry? Get your favorite campus meals delivered to your dorm!',
      cta: 'Order Now',
      icon: '🍕',
      gradient: 'from-red-400 to-red-500',
      textColor: 'text-white',
      ctaClass: 'bg-white text-red-600 hover:bg-red-50',
      badge: 'AD'
    },
    {
      id: 'sidebar-ad-7',
      type: 'advertisement',
      title: 'Ride Share',
      description: 'Going home for the weekend? Find students heading your way!',
      cta: 'Find Rides',
      icon: '🚗',
      gradient: 'from-teal-400 to-teal-500',
      textColor: 'text-white',
      ctaClass: 'bg-white text-teal-600 hover:bg-teal-50',
      badge: 'AD'
    },
    {
      id: 'sidebar-ad-8',
      type: 'advertisement',
      title: 'Mental Wellness',
      description: 'Free counseling & support services. Your wellbeing matters!',
      cta: 'Learn More',
      icon: '🧘',
      gradient: 'from-indigo-400 to-indigo-500',
      textColor: 'text-white',
      ctaClass: 'bg-white text-indigo-600 hover:bg-indigo-50',
      badge: 'AD'
    }
  ]

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

    // Basic validation
    if (!postFormData.title || !postFormData.description || !postFormData.price || !postFormData.category) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    if (selectedImages.length === 0) {
      showToast('Please upload at least one image', 'error')
      return
    }

    setIsSubmittingPost(true)

    try {
      // If admin, add to official store instead of marketplace
      if (isAdmin) {
        const newOfficialItem = {
          id: `official_${Date.now()}`,
          title: postFormData.title,
          description: postFormData.description,
          price: `KSH ${parseFloat(postFormData.price).toLocaleString()}`,
          image: selectedImages[0]?.url || '📦',
          link: '',
          addedBy: 'admin',
          createdAt: new Date().toISOString()
        }

        const existingOfficialItems = JSON.parse(localStorage.getItem('officialStoreItems') || '[]')
        const updatedOfficialItems = [newOfficialItem, ...existingOfficialItems]
        localStorage.setItem('officialStoreItems', JSON.stringify(updatedOfficialItems))

        alert('Product added to Official Store successfully!')
        handleClosePostModal()
        setActiveTab('official-store')
        return
      }

      // Step 1: Upload images to Cloudinary via backend
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
        tags: postFormData.tags || []
      }

      // Debug logging
      console.log('🔍 Product Data being sent:', productData)
      console.log('🔍 Form Data state:', postFormData)
      console.log('🔍 Auth Token:', authToken ? 'Present' : 'Missing')

      const createResponse = await api.createProduct(productData, authToken)

      if (createResponse.status === 'success') {
        // Refresh products list
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
    }
  }

  // Image upload functionality
  const handleImageUpload = (e) => {
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

    // Create preview URLs and convert to base64
    const newImageUrls = []
    const newImages = []

    validFiles.forEach((file, index) => {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      newImageUrls.push(previewUrl)

      // Convert to base64 for preview and store file object for upload
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = {
          url: e.target.result,
          file: file, // Store the actual file object for API upload
          name: file.name,
          size: file.size,
          type: file.type
        }
        newImages.push(imageData)

        // Update state when all files are processed
        if (newImages.length === validFiles.length) {
          setSelectedImages(prev => [...prev, ...newImages])
          setImagePreviewUrls(prev => [...prev, ...newImageUrls])
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
      {/* Announcement Bar */}
      <div className="bg-gradient-orange py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white text-sm">
            <span className="font-medium">
              🎉 NEW: Check out our Official Store for exclusive E-Campus merchandise!
            </span>
            <button
              onClick={handleShopNowClick}
              className="ml-2 underline font-bold hover:text-orange-100 transition-colors cursor-pointer"
            >
              Shop Now
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-blue-600" size={28} />
              <span className="text-xl font-bold text-gray-900">E-Campus</span>
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
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-3">
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
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
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

            {/* Featured Official Store Section */}
            <section className="mb-12 bg-gradient-to-r from-orange-50 via-orange-100 to-yellow-50 rounded-xl border-2 border-orange-200 p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Store className="text-orange-600" size={32} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold text-gray-900">Official E-Campus Store</h2>
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        OFFICIAL
                      </span>
                    </div>
                    <p className="text-gray-600">Exclusive campus merchandise and essentials</p>
                  </div>
                </div>
                <button
                  onClick={handleShopNowClick}
                  className="hidden md:flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  View All →
                </button>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {getOfficialStoreItems().map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg overflow-hidden border-2 border-orange-200 hover:shadow-xl hover:border-orange-400 transition-all duration-300 cursor-pointer"
                  >
                    {/* Image Area with Badge */}
                    <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 h-32 flex items-center justify-center">
                      {item.image?.startsWith('data:') || item.image?.startsWith('http') ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : (
                        <span className="text-6xl">{item.images?.[0] || item.image || '📦'}</span>
                      )}
                      <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        {item.badge || 'OFFICIAL'}
                      </span>
                    </div>

                    {/* Product Info */}
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-orange-600 font-bold text-lg mb-2">
                        {typeof item.price === 'number' ? `KES ${item.price.toLocaleString()}` : item.price}
                      </p>
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg font-semibold transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile View All Button */}
              <button
                onClick={handleShopNowClick}
                className="md:hidden w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                View All →
              </button>
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
              ) : (
                <>
                  {/* Listings Grid with Integrated Ads */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getMappedProducts().map((item, index) => {
                      // Smart Native Ad Rotation Algorithm
                      // Shows ads starting from firstAdPosition, then every nativeAdFrequency products
                      // Rotates through all available native ads using modulo
                      const shouldShowNativeAd = index >= AD_CONFIG.firstAdPosition &&
                                                   (index - AD_CONFIG.firstAdPosition) % AD_CONFIG.nativeAdFrequency === 0
                      const nativeAdRotationIndex = Math.floor((index - AD_CONFIG.firstAdPosition) / AD_CONFIG.nativeAdFrequency)
                      const nativeAdToShow = nativeAdRotationIndex % nativeAds.length
                      const showNativeAd = shouldShowNativeAd && nativeAdRotationIndex < AD_CONFIG.maxAdsPerPage

                      // Smart Sidebar Ad Rotation Algorithm for Mobile
                      // Shows ads at strategic intervals, rotating through all available sidebar ads
                      const shouldShowSidebarAd = index >= AD_CONFIG.firstAdPosition &&
                                                    (index - AD_CONFIG.firstAdPosition) % AD_CONFIG.sidebarAdFrequency === 0
                      const sidebarAdRotationIndex = Math.floor((index - AD_CONFIG.firstAdPosition) / AD_CONFIG.sidebarAdFrequency)
                      const sidebarAdToShow = sidebarAdRotationIndex % sidebarAds.length
                      const showSidebarAd = shouldShowSidebarAd && sidebarAdRotationIndex < AD_CONFIG.maxAdsPerPage

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
                                <h3 className="font-semibold text-gray-900 text-lg flex-1">
                                  {item.title}
                                </h3>
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

            {/* Sticky Sidebar - Desktop Only */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-20 space-y-6">
                {/* Official Store Promotion Card */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl overflow-hidden shadow-lg">
                  <div className="p-6 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <ShoppingBag size={24} />
                      <span className="bg-white text-orange-600 text-xs px-2 py-1 rounded-full font-bold">
                        OFFICIAL STORE
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">E-Campus Merch</h3>
                    <p className="text-orange-50 mb-4 text-sm">
                      Get exclusive campus merchandise and accessories. Show your school pride!
                    </p>
                    <button
                      onClick={handleShopNowClick}
                      className="w-full bg-white text-orange-600 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors mb-3"
                    >
                      Shop Now →
                    </button>
                  </div>
                  <div className="bg-orange-700 bg-opacity-50 px-6 py-3 text-center text-white text-sm font-semibold">
                    ✨ Limited Edition Items Available
                  </div>
                </div>

                {/* Campus Gym Ad */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                  <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full font-semibold inline-block mb-3">
                    ADVERTISEMENT
                  </span>
                  <h3 className="text-xl font-bold mb-2">Campus Gym</h3>
                  <p className="text-purple-50 text-sm mb-4">
                    Get fit with our state-of-the-art facilities. Student discount: 30% off!
                  </p>
                  <button className="w-full bg-white text-purple-600 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors text-sm">
                    Learn More
                  </button>
                </div>

                {/* Study Lounge Ad */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                  <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full font-semibold inline-block mb-3">
                    ADVERTISEMENT
                  </span>
                  <h3 className="text-xl font-bold mb-2">Study Lounge</h3>
                  <p className="text-green-50 text-sm mb-4">
                    Quiet study spaces available 24/7. Reserve your spot today!
                  </p>
                  <button className="w-full bg-white text-green-600 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors text-sm">
                    Book Now
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
        {activeTab === 'official-store' && (
          <div>
            {/* Hero Banner */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 md:p-12 mb-12 text-white text-center">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Store size={40} />
                  <span className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full font-bold">
                    OFFICIAL
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  E-Campus Official Store
                </h1>
                <p className="text-xl text-blue-100">
                  Premium quality merchandise for students. Show your campus pride with our exclusive collection!
                </p>
              </div>
            </section>

            {/* Store Products Grid */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Our Products</h2>
                {isAdmin && (
                  <button
                    onClick={handleAddOfficialStoreItem}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                  >
                    <Plus size={18} />
                    Add Product
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getOfficialStoreItems().map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedProduct(item)}
                    className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  >
                    {/* Image Area */}
                    <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 h-64 flex items-center justify-center">
                      {item.image?.startsWith('data:') || item.image?.startsWith('http') ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : (
                        <span className="text-8xl">{item.images?.[0] || item.image || '📦'}</span>
                      )}
                      <div style={{ display: 'none' }} className="w-full h-full flex items-center justify-center">
                        <span className="text-8xl">{item.images?.[0] || item.image || '📦'}</span>
                      </div>

                      {/* Official Badge */}
                      <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                        {item.badge || 'OFFICIAL'}
                      </span>

                      {/* +X More Badge */}
                      {item.images?.length > 1 && (
                        <span className="absolute top-3 right-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          +{item.images.length - 1} more
                        </span>
                      )}

                      {/* Delete Button (Admin only, for custom items) */}
                      {isAdmin && !storeItemsStatic.some(staticItem => staticItem.id === item.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteOfficialStoreItem(item.id)
                          }}
                          className="absolute bottom-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                          title="Delete product"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 text-xl flex-1">
                          {item.title}
                        </h3>
                        <span className="text-orange-600 font-bold text-2xl ml-2">
                          {typeof item.price === 'number' ? `KES ${item.price.toLocaleString()}` : item.price}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {item.description}
                      </p>

                      <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">About E-Campus</h1>
              <p className="text-gray-600">Your trusted campus marketplace</p>
            </div>

            {/* Introduction */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Are</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                E-Campus is a <strong>free advertisement platform</strong> designed to connect campus community members for buying and selling items. We provide a space where students can post and browse listings for textbooks, electronics, furniture, and more.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Important:</strong> E-Campus is purely an advertisement website. We do not process payments, facilitate transactions, or handle any in-app purchases. All transactions occur directly between buyers and sellers.
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
                  <span><strong>No Liability:</strong> E-Campus is not responsible for any fraudulent activities, scams, or disputes between buyers and sellers.</span>
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

                {/* Delete Button - Admin only for official store custom items */}
                {isAdmin && (selectedProduct.contactEmail || selectedProduct.contactPhone) &&
                 !storeItemsStatic.some(staticItem => staticItem.id === selectedProduct.id) && (
                  <div className="border-t pt-6">
                    <button
                      onClick={() => handleDeleteOfficialStoreItem(selectedProduct.id)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={20} />
                      Delete Official Store Product
                    </button>
                  </div>
                )}
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
                    required
                  />
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
                    required
                  />
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
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
                    disabled={isSubmittingPost}
                  >
                    {isSubmittingPost ? 'Posting...' : 'Post Item'}
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
                />
                <p className="text-xs text-gray-500 mt-2">Default password: admin123</p>
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

      {/* Official Store Add Product Modal (Admin Only) */}
      {showOfficialStoreModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowOfficialStoreModal(false)
            }
          }}
        >
          <div className="bg-white rounded-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Official Store Product</h2>
              <button
                onClick={() => setShowOfficialStoreModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleOfficialStoreSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    value={officialStoreFormData.title}
                    onChange={(e) => setOfficialStoreFormData({ ...officialStoreFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="E-Campus Hoodie"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={officialStoreFormData.description}
                    onChange={(e) => setOfficialStoreFormData({ ...officialStoreFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Premium quality hoodie with campus logo..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (KSH) *
                  </label>
                  <input
                    type="number"
                    value={officialStoreFormData.price}
                    onChange={(e) => setOfficialStoreFormData({ ...officialStoreFormData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="4500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL *
                  </label>
                  <input
                    type="text"
                    value={officialStoreFormData.image}
                    onChange={(e) => setOfficialStoreFormData({ ...officialStoreFormData, image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg or use emoji 👕"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={officialStoreFormData.link}
                    onChange={(e) => setOfficialStoreFormData({ ...officialStoreFormData, link: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://store.ecampus.com/product"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={officialStoreFormData.contactEmail}
                    onChange={(e) => setOfficialStoreFormData({ ...officialStoreFormData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="store@yourdomain.edu"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    value={officialStoreFormData.contactPhone}
                    onChange={(e) => setOfficialStoreFormData({ ...officialStoreFormData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowOfficialStoreModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Add Product
                </button>
              </div>
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
                <span className="text-xl font-bold text-white">E-Campus</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your trusted campus marketplace. Buy and sell with fellow students safely and easily.
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
                  href="#"
                  className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={20} className="text-gray-300" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Border with Copyright */}
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} E-Campus. All rights reserved.
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
