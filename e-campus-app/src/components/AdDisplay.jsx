import { useState, useEffect, useMemo } from 'react'
import { ExternalLink } from 'lucide-react'
import { useActiveAds } from '../hooks/useApi'
import { api } from '../services/api'

export default function AdDisplay({ position = 'sidebar', fallbackToAdSense = true }) {
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

  // If no direct ads available, show AdSense (if enabled)
  if (ads.length === 0) {
    if (fallbackToAdSense) {
      return <GoogleAdSense position={position} />
    }
    return null
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

// Banner Ad (wide, top of page)
function BannerAd({ ad, onClick }) {
  return (
    <div className="w-full bg-gray-50 border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="relative" onClick={onClick}>
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-24 sm:h-32 object-cover"
        />
        <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600 flex items-center gap-1">
          <span>Sponsored</span>
          <ExternalLink size={12} />
        </div>
      </div>
      <div className="p-3 bg-white">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {ad.title}
        </h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-1">{ad.description}</p>
      </div>
    </div>
  )
}

// Sidebar Ad (square/vertical)
function SidebarAd({ ad, onClick }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="relative" onClick={onClick}>
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full aspect-square object-cover"
        />
        <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600 flex items-center gap-1">
          <span>Ad</span>
          <ExternalLink size={12} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {ad.title}
        </h3>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{ad.description}</p>
        <button
          onClick={onClick}
          className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Learn More
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

// Internal Promotion Component (shown when AdSense not configured)
function InternalPromo({ position }) {
  const promos = {
    banner: {
      title: "Sell Your Items on E-Campus",
      description: "Turn your unused items into cash. List for free and reach thousands of students!",
      buttonText: "Start Selling",
      icon: "📦",
      gradient: "from-blue-500 to-purple-600"
    },
    sidebar: {
      title: "Quick Selling Tips",
      tips: [
        "Take clear, well-lit photos",
        "Set competitive prices",
        "Respond to buyers quickly",
        "Meet in safe, public places"
      ],
      icon: "💡"
    }
  }

  const promo = promos[position] || promos.sidebar

  if (position === 'banner') {
    return (
      <div className={`w-full bg-gradient-to-r ${promo.gradient} rounded-lg overflow-hidden`}>
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 text-white">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <span className="text-4xl">{promo.icon}</span>
            <div>
              <h3 className="font-bold text-lg">{promo.title}</h3>
              <p className="text-white/90 text-sm mt-1">{promo.description}</p>
            </div>
          </div>
          <button className="bg-white text-blue-600 font-semibold px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap">
            {promo.buttonText}
          </button>
        </div>
      </div>
    )
  }

  if (position === 'sidebar') {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{promo.icon}</span>
          <h3 className="font-bold text-gray-800">{promo.title}</h3>
        </div>
        <ul className="space-y-3">
          {promo.tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-500 mt-0.5">✓</span>
              {tip}
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t border-amber-200">
          <p className="text-xs text-gray-500 text-center">Sell smarter, not harder</p>
        </div>
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

// Google AdSense Fallback Component
function GoogleAdSense({ position }) {
  useEffect(() => {
    // Initialize AdSense
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  // Get AdSense configuration from environment variables or use defaults
  const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT || 'ca-pub-XXXXXXXXXXXXXXXX'

  // Different ad slots for different positions
  const getAdConfig = () => {
    switch (position) {
      case 'banner':
        return {
          slot: import.meta.env.VITE_ADSENSE_SLOT_BANNER || 'XXXXXXXXXX',
          format: 'horizontal',
          style: { display: 'block', textAlign: 'center' }
        }
      case 'sidebar':
      default:
        return {
          slot: import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR || 'XXXXXXXXXX',
          format: 'rectangle',
          style: { display: 'block' }
        }
    }
  }

  const adConfig = getAdConfig()

  // Show internal promo content when AdSense is not configured
  if (ADSENSE_CLIENT.includes('XXXX')) {
    return <InternalPromo position={position} />
  }

  return (
    <div className="adsense-container">
      <ins
        className="adsbygoogle"
        style={adConfig.style}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={adConfig.slot}
        data-ad-format={adConfig.format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
