import { Star, TrendingUp } from 'lucide-react'

export default function SponsoredBadge({ variant = 'default', size = 'medium' }) {
  // Different badge styles
  const variants = {
    default: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
    subtle: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    premium: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    simple: 'bg-gray-100 text-gray-600 border border-gray-300'
  }

  const sizes = {
    small: {
      badge: 'px-2 py-0.5 text-xs',
      icon: 12
    },
    medium: {
      badge: 'px-3 py-1 text-sm',
      icon: 14
    },
    large: {
      badge: 'px-4 py-1.5 text-base',
      icon: 16
    }
  }

  const badgeClasses = `inline-flex items-center gap-1 rounded-full font-semibold ${variants[variant]} ${sizes[size].badge}`

  return (
    <span className={badgeClasses}>
      <Star size={sizes[size].icon} fill="currentColor" />
      Sponsored
    </span>
  )
}

// Featured Sponsored Badge (for top placements)
export function FeaturedSponsoredBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
      <TrendingUp size={14} />
      <span>Featured</span>
      <Star size={12} fill="currentColor" />
    </div>
  )
}

// Simple text-only sponsored indicator
export function SponsoredText({ className = '' }) {
  return (
    <span className={`text-xs text-gray-500 italic ${className}`}>
      Sponsored
    </span>
  )
}
