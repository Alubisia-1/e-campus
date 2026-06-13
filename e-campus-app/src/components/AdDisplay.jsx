import { useState, useEffect, useMemo } from 'react'
import { ExternalLink, Book, Laptop, Sofa, Shirt, Smartphone, Coffee, ArrowRight } from 'lucide-react'
import { useActiveAds } from '../hooks/useApi'
import { api } from '../services/api'

export default function AdDisplay({ position = 'sidebar' }) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [impressionTracked, setImpressionTracked] = useState(false)

  // Use React Query hook for ads with proper caching
  const { data, isLoading: loading } = useActiveAds(position)
  // Map backend fields to frontend expected fields
  const ads = useMemo(() => {
    const rawAds = data?.data || []
    return rawAds.map(ad => ({
      ...ad,
      title: ad.company || ad.title,
      description: ad.message || ad.description,
      targetUrl: ad.link || ad.targetUrl,
    }))
  }, [data])

  // Rotate ads every 30 seconds if multiple ads available
  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length)
        setImpressionTracked(false) // Track impression for new ad
      }, 30000) // 30 seconds

      return () => clearInterval(interval)
    }
  }, [ads.length])

  // Track impression when ad is displayed
  useEffect(() => {
    if (ads.length > 0 && !impressionTracked && ads[currentAdIndex]) {
      trackImpression(ads[currentAdIndex]._id)
      setImpressionTracked(true)
    }
  }, [currentAdIndex, ads, impressionTracked])

  // Track impression
  const trackImpression = async (adId) => {
    try {
      await api.trackAdImpression(adId)
    } catch (err) {
      console.error('Error tracking impression:', err)
    }
  }

  // Track click
  const handleAdClick = async (ad) => {
    try {
      await api.trackAdClick(ad._id)
      // Open ad link in new tab
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer')
    } catch (err) {
      console.error('Error tracking click:', err)
      // Still open the link even if tracking fails
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // If loading, show skeleton
  if (loading) {
    return <AdSkeleton position={position} />
  }

  // If no customer ads are available, show a simple internal promo (no third-party ads)
  if (ads.length === 0) {
    return <InternalPromo position={position} />
  }

  // Get current ad to display
  const currentAd = ads[currentAdIndex]

  // Render based on position
  return (
    <div className={`ad-display ad-position-${position}`}>
      {position === 'banner' && (
        <BannerAd ad={currentAd} onClick={() => handleAdClick(currentAd)} />
      )}

      {position === 'sidebar' && (
        <SidebarAd ad={currentAd} onClick={() => handleAdClick(currentAd)} />
      )}

      {/* Indicator for multiple ads */}
      {ads.length > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {ads.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentAdIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Pick a deterministic gradient + icon from PRODUCT_ADS based on ad id/title
function pickAdTheme(ad) {
  const key = (ad?._id || ad?.title || ad?.company || '') + ''
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0
  const idx = Math.abs(hash) % PRODUCT_ADS.length
  return PRODUCT_ADS[idx]
}

// Banner Ad (wide, top of page)
function BannerAd({ ad, onClick }) {
  const theme = pickAdTheme(ad)
  const Icon = theme.Icon
  const hasImage = !!ad.imageUrl

  return (
    <div
      onClick={onClick}
      className="relative w-full rounded-2xl overflow-hidden shadow-md cursor-pointer group hover:shadow-lg transition-shadow"
    >
      {hasImage ? (
        <div className="relative">
          <img src={ad.imageUrl} alt={ad.title} className="w-full h-32 sm:h-40 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          <div className="absolute top-3 left-3 bg-white/15 backdrop-blur-sm text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded">
            Sponsored
          </div>
          <div className="absolute inset-0 flex items-center justify-between p-6 text-white">
            <div className="max-w-xl">
              <h3 className="font-bold text-xl sm:text-2xl mb-1">{ad.title}</h3>
              <p className="text-white/90 text-sm line-clamp-2">{ad.description}</p>
            </div>
            <ExternalLink size={20} className="text-white/80 flex-shrink-0 ml-4" />
          </div>
        </div>
      ) : (
        <div className={`relative bg-gradient-to-r ${theme.gradient} text-white`}>
          <div className="absolute top-3 left-3 bg-white/15 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded">
            Sponsored
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <Icon size={220} className="text-white" strokeWidth={1.2} />
          </div>
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8">
            <div className="flex items-center gap-5 flex-1">
              <div className="hidden sm:flex w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl items-center justify-center flex-shrink-0">
                <Icon size={32} className="text-white" />
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                  <span className={`${theme.accent} text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded`}>
                    {theme.badge}
                  </span>
                  <span className="text-white/70 text-xs font-medium">{theme.category}</span>
                </div>
                <h3 className="font-bold text-xl sm:text-2xl mb-1">{ad.title}</h3>
                <p className="text-white/85 text-sm max-w-xl line-clamp-2">{ad.description}</p>
              </div>
            </div>
            <button
              onClick={onClick}
              className="bg-white text-[#1E1E1E] font-semibold px-6 py-3 rounded-xl hover:bg-[#F5F2ED] transition-colors whitespace-nowrap inline-flex items-center gap-2 shadow-sm"
            >
              Learn More
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Sidebar Ad (square/vertical)
function SidebarAd({ ad, onClick }) {
  const theme = pickAdTheme(ad)
  const Icon = theme.Icon
  const hasImage = !!ad.imageUrl

  return (
    <div className={`bg-gradient-to-br ${theme.sidebarBg} border ${theme.sidebarBorder} rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer group`}>
      {hasImage ? (
        <div className="relative" onClick={onClick}>
          <img src={ad.imageUrl} alt={ad.title} className="w-full aspect-square object-cover" />
          <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1">
            Sponsored
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-4 pt-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Sponsored</span>
            <span className={`${theme.accent} text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded`}>
              {theme.badge}
            </span>
          </div>
          <div className="px-4 pt-4 text-center">
            <div className={`w-20 h-20 mx-auto mb-3 ${theme.iconBg} rounded-2xl flex items-center justify-center`}>
              <Icon size={40} className={theme.iconColor} strokeWidth={1.5} />
            </div>
          </div>
        </>
      )}
      <div className="px-4 pb-4 pt-2">
        <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-[#3E5C50] transition-colors">
          {ad.title}
        </h3>
        <p className="text-xs text-gray-600 mt-2 leading-relaxed line-clamp-3">{ad.description}</p>
        <button
          onClick={onClick}
          className="mt-4 w-full bg-[#3E5C50] hover:bg-[#2E4540] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
        >
          Learn More
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}

// Loading skeleton
function AdSkeleton({ position }) {
  if (position === 'banner') {
    return (
      <div className="w-full bg-gray-100 border border-gray-200 rounded-lg overflow-hidden animate-pulse">
        <div className="w-full h-32 bg-gray-200"></div>
        <div className="p-3">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (position === 'sidebar') {
    return (
      <div className="bg-gray-100 border border-gray-200 rounded-lg overflow-hidden animate-pulse">
        <div className="w-full aspect-square bg-gray-200"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return null
}

// Product-style sponsored ad templates (rotating)
const PRODUCT_ADS = [
  {
    Icon: Book,
    category: 'Textbooks',
    title: 'Save Big on Used Textbooks',
    description: 'Up to 70% off retail. Find your semester\'s books from fellow students.',
    cta: 'Shop Textbooks',
    badge: 'Best Seller',
    gradient: 'from-[#3E5C50] to-[#4E7C63]',
    accent: 'bg-[#B86B3E]',
    sidebarBg: 'from-emerald-50 to-teal-50',
    sidebarBorder: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
  },
  {
    Icon: Laptop,
    category: 'Electronics',
    title: 'Student-Priced Laptops',
    description: 'Quality laptops & accessories from verified student sellers on campus.',
    cta: 'Browse Electronics',
    badge: 'Hot Deals',
    gradient: 'from-slate-700 to-slate-900',
    accent: 'bg-[#B86B3E]',
    sidebarBg: 'from-slate-50 to-blue-50',
    sidebarBorder: 'border-slate-200',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
  },
  {
    Icon: Sofa,
    category: 'Hostel Essentials',
    title: 'Furnish Your Room for Less',
    description: 'Beds, desks, chairs & more from graduating students nearby.',
    cta: 'Find Furniture',
    badge: 'Local Pickup',
    gradient: 'from-[#B86B3E] to-amber-700',
    accent: 'bg-[#3E5C50]',
    sidebarBg: 'from-amber-50 to-orange-50',
    sidebarBorder: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
  },
  {
    Icon: Smartphone,
    category: 'Mobile & Tech',
    title: 'Phones & Gadgets',
    description: 'Pre-loved smartphones, tablets and chargers at student-friendly prices.',
    cta: 'Shop Gadgets',
    badge: 'Trending',
    gradient: 'from-purple-700 to-indigo-800',
    accent: 'bg-[#B86B3E]',
    sidebarBg: 'from-purple-50 to-indigo-50',
    sidebarBorder: 'border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-700',
  },
  {
    Icon: Shirt,
    category: 'Fashion',
    title: 'Campus Fashion Finds',
    description: 'Trendy clothing, shoes and accessories swapped between students.',
    cta: 'Shop Fashion',
    badge: 'New Arrivals',
    gradient: 'from-pink-600 to-rose-700',
    accent: 'bg-[#3E5C50]',
    sidebarBg: 'from-pink-50 to-rose-50',
    sidebarBorder: 'border-pink-200',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-700',
  },
  {
    Icon: Coffee,
    category: 'Kitchen & Living',
    title: 'Dorm Kitchen Essentials',
    description: 'Kettles, microwaves, cookware and more — ready for your next semester.',
    cta: 'Shop Essentials',
    badge: 'Top Rated',
    gradient: 'from-[#4E7C63] to-[#3E5C50]',
    accent: 'bg-[#B86B3E]',
    sidebarBg: 'from-teal-50 to-emerald-50',
    sidebarBorder: 'border-teal-200',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-700',
  },
]

// Internal Promotion Component — rotates product-style sponsored ads
function InternalPromo({ position }) {
  const [adIndex, setAdIndex] = useState(() => Math.floor(Math.random() * PRODUCT_ADS.length))

  useEffect(() => {
    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % PRODUCT_ADS.length)
    }, 12000)
    return () => clearInterval(interval)
  }, [])

  const ad = PRODUCT_ADS[adIndex]
  const Icon = ad.Icon

  const scrollToProducts = () => {
    const section = document.getElementById('product-listings')
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (position === 'banner') {
    return (
      <div className={`relative w-full bg-gradient-to-r ${ad.gradient} rounded-2xl overflow-hidden shadow-md`}>
        <div className="absolute top-3 left-3 bg-white/15 backdrop-blur-sm text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded">
          Sponsored
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <Icon size={220} className="text-white" strokeWidth={1.2} />
        </div>
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 text-white">
          <div className="flex items-center gap-5 flex-1">
            <div className="hidden sm:flex w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl items-center justify-center flex-shrink-0">
              <Icon size={32} className="text-white" />
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                <span className={`${ad.accent} text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded`}>
                  {ad.badge}
                </span>
                <span className="text-white/70 text-xs font-medium">{ad.category}</span>
              </div>
              <h3 className="font-bold text-xl sm:text-2xl mb-1">{ad.title}</h3>
              <p className="text-white/85 text-sm max-w-xl">{ad.description}</p>
            </div>
          </div>
          <button
            onClick={scrollToProducts}
            className="bg-white text-[#1E1E1E] font-semibold px-6 py-3 rounded-xl hover:bg-[#F5F2ED] transition-colors whitespace-nowrap inline-flex items-center gap-2 shadow-sm"
          >
            {ad.cta}
            <ArrowRight size={18} />
          </button>
        </div>
        {PRODUCT_ADS.length > 1 && (
          <div className="absolute bottom-2 right-3 flex gap-1">
            {PRODUCT_ADS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${i === adIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (position === 'sidebar') {
    return (
      <div className={`bg-gradient-to-br ${ad.sidebarBg} border ${ad.sidebarBorder} rounded-xl overflow-hidden shadow-sm`}>
        <div className="flex items-center justify-between px-4 pt-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Sponsored</span>
          <span className={`${ad.accent} text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded`}>
            {ad.badge}
          </span>
        </div>
        <div className="px-4 pt-4 pb-2 text-center">
          <div className={`w-20 h-20 mx-auto mb-3 ${ad.iconBg} rounded-2xl flex items-center justify-center`}>
            <Icon size={40} className={ad.iconColor} strokeWidth={1.5} />
          </div>
          <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{ad.category}</div>
          <h3 className="font-bold text-gray-900 text-base leading-snug mb-2">{ad.title}</h3>
          <p className="text-xs text-gray-600 leading-relaxed mb-4">{ad.description}</p>
        </div>
        <div className="px-4 pb-4">
          <button
            onClick={scrollToProducts}
            className="w-full bg-[#3E5C50] hover:bg-[#2E4540] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
          >
            {ad.cta}
            <ArrowRight size={14} />
          </button>
        </div>
        {PRODUCT_ADS.length > 1 && (
          <div className="flex justify-center gap-1 pb-3">
            {PRODUCT_ADS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${i === adIndex ? 'w-4 bg-[#3E5C50]' : 'w-1 bg-gray-300'}`}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Default fallback
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
      <p className="text-gray-600 font-medium">E-Campus Marketplace</p>
      <p className="text-sm text-gray-500 mt-1">Buy & sell with students near you</p>
    </div>
  )
}

