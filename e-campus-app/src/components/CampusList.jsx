import React from 'react'
import { MapPin, ChevronDown } from 'lucide-react'

/**
 * CampusList Component - Filter products by campus
 * Dropdown select with modern styling
 */
function CampusList({ campuses, selectedCampus, onCampusSelect, loading, products }) {
  // Calculate item counts for each campus
  const getCampusItemCount = (campusName) => {
    if (!products || !campusName) return 0
    return products.filter(product =>
      product.location?.campus?.toLowerCase() === campusName.toLowerCase()
    ).length
  }

  // Get total items count
  const getTotalItemCount = () => {
    if (!products) return 0
    return products.length
  }

  if (loading) {
    return (
      <div className="skeleton h-11 w-48 rounded-xl" />
    )
  }

  if (!campuses || campuses.length === 0) {
    return null
  }

  const activeCampuses = campuses.filter(c => c.isActive)

  return (
    <div className="relative block w-full max-w-full sm:inline-block sm:w-auto">
      <div className="relative w-full max-w-full">
        <MapPin
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
        />
        <select
          value={selectedCampus || ''}
          onChange={(e) => onCampusSelect(e.target.value || null)}
          style={{ textOverflow: 'ellipsis' }}
          className={`block appearance-none pl-9 pr-10 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer w-full max-w-full min-w-0 overflow-hidden whitespace-nowrap sm:w-auto sm:min-w-[180px] ${
            selectedCampus
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25'
              : 'bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-200 hover:border-teal-400'
          }`}
        >
          <option value="" className="text-slate-700 bg-white" style={{ color: '#334155', backgroundColor: '#ffffff' }}>
            All Campuses ({activeCampuses.length})
          </option>
          {activeCampuses.map((campus) => {
            const itemCount = getCampusItemCount(campus.name)
            return (
              <option
                key={campus._id}
                value={campus.name}
                className="text-slate-700 bg-white"
                style={{ color: '#334155', backgroundColor: '#ffffff' }}
              >
                {campus.name} ({itemCount})
              </option>
            )
          })}
        </select>
        <ChevronDown
          size={16}
          className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
            selectedCampus ? 'text-white' : 'text-slate-400'
          }`}
        />
      </div>
    </div>
  )
}

export default CampusList
