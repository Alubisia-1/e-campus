import { useEffect } from 'react'

/**
 * Google AdSense Component
 *
 * Usage:
 * <GoogleAdSense
 *   adSlot="1234567890"
 *   adFormat="auto"
 *   style={{ display: 'block' }}
 * />
 *
 * Common ad formats:
 * - "auto" - Responsive (recommended)
 * - "rectangle" - 300x250
 * - "vertical" - 160x600
 * - "horizontal" - 728x90
 */
const GoogleAdSense = ({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = {},
  className = ''
}) => {
  useEffect(() => {
    try {
      // Push ad to AdSense
      if (window.adsbygoogle && process.env.NODE_ENV === 'production') {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  return (
    <div className={className} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  )
}

export default GoogleAdSense
