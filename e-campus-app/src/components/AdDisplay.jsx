import { useState, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'
import api from '../services/api'

export default function AdDisplay({ position = 'sidebar', fallbackToAdSense = true }) {
  const [ads, setAds] = useState([])
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [impressionTracked, setImpressionTracked] = useState(false)

  // Fetch active ads for this position
  useEffect(() => {
    fetchAds()
  }, [position])

  const fetchAds = async () => {
    setLoading(true)
    try {
      const response = await api.getActiveAds(position)
      const activeAds = response.data.ads || []
      setAds(activeAds)

      // Reset index when ads change
      setCurrentAdIndex(0)
      setImpressionTracked(false)
    } catch (err) {
      console.error('Error fetching ads:', err)
      setAds([])
    } finally {
      setLoading(false)
    }
  }

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

      {position === 'footer' && (
        <FooterAd ad={currentAd} onClick={() => handleAdClick(currentAd)} />
      )}

      {position === 'header' && (
        <HeaderAd ad={currentAd} onClick={() => handleAdClick(currentAd)} />
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

// Footer Ad (wide, bottom of page)
function FooterAd({ ad, onClick }) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4" onClick={onClick}>
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full sm:w-32 h-24 object-cover rounded"
        />
        <div className="flex-1 text-center sm:text-left">
          <div className="text-xs text-gray-500 mb-1">Sponsored</div>
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            {ad.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{ad.description}</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap flex items-center gap-2">
          Visit <ExternalLink size={16} />
        </button>
      </div>
    </div>
  )
}

// Header Ad (thin banner)
function HeaderAd({ ad, onClick }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all" onClick={onClick}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">{ad.title}</span>
          <span className="text-xs opacity-90">{ad.description}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span>Learn More</span>
          <ExternalLink size={14} />
        </div>
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
        return {
          slot: import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR || 'XXXXXXXXXX',
          format: 'rectangle',
          style: { display: 'block' }
        }
      case 'footer':
        return {
          slot: import.meta.env.VITE_ADSENSE_SLOT_FOOTER || 'XXXXXXXXXX',
          format: 'horizontal',
          style: { display: 'block', textAlign: 'center' }
        }
      case 'header':
        return {
          slot: import.meta.env.VITE_ADSENSE_SLOT_HEADER || 'XXXXXXXXXX',
          format: 'horizontal',
          style: { display: 'block', textAlign: 'center' }
        }
      default:
        return {
          slot: import.meta.env.VITE_ADSENSE_SLOT_DEFAULT || 'XXXXXXXXXX',
          format: 'rectangle',
          style: { display: 'block' }
        }
    }
  }

  const adConfig = getAdConfig()

  // Don't show AdSense if not configured (still has placeholder values)
  if (ADSENSE_CLIENT.includes('XXXX')) {
    return (
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500 font-medium">AdSense Placeholder</p>
        <p className="text-xs text-gray-400 mt-2">Configure AdSense to show ads here</p>
      </div>
    )
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
