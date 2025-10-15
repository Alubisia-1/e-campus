import GoogleAdSense from './GoogleAdSense'

/**
 * Pre-configured AdSense placements for different positions
 */

// Banner Ad - Top of page (728x90 or responsive)
export const BannerAd = () => {
  return (
    <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
      <div className="text-xs text-gray-400 text-center mb-2">Advertisement</div>
      <GoogleAdSense
        adSlot="1234567890"
        adFormat="horizontal"
        style={{ display: 'block', textAlign: 'center', minHeight: '90px' }}
      />
    </div>
  )
}

// Sidebar Ad - Right sidebar (300x250 or 160x600)
export const SidebarAd = () => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <div className="text-xs text-gray-400 text-center mb-2">Advertisement</div>
      <GoogleAdSense
        adSlot="0987654321"
        adFormat="rectangle"
        style={{ display: 'block', minHeight: '250px' }}
      />
    </div>
  )
}

// In-feed Ad - Between products
export const InFeedAd = () => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-4">
      <div className="text-xs text-gray-400 text-center mb-2">Sponsored</div>
      <GoogleAdSense
        adSlot="1122334455"
        adFormat="fluid"
        style={{ display: 'block', minHeight: '200px' }}
      />
    </div>
  )
}

// Mobile Banner - Sticky at bottom (320x50)
export const MobileBannerAd = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-50 md:hidden">
      <div className="text-xs text-gray-400 text-center mb-1">Advertisement</div>
      <GoogleAdSense
        adSlot="5544332211"
        adFormat="auto"
        style={{ display: 'block', minHeight: '50px' }}
      />
    </div>
  )
}

// Responsive Ad - Auto-adjusts to container
export const ResponsiveAd = ({ className = '' }) => {
  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="text-xs text-gray-400 text-center mb-2">Advertisement</div>
      <GoogleAdSense
        adSlot="6677889900"
        adFormat="auto"
        fullWidthResponsive={true}
        style={{ display: 'block', minHeight: '100px' }}
      />
    </div>
  )
}
