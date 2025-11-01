import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, DollarSign, Eye, MousePointer, TrendingUp } from 'lucide-react'
import api from '../services/api'
import AdForm from './AdForm'

export default function AdManager({ authToken }) {
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAdForm, setShowAdForm] = useState(false)
  const [editingAd, setEditingAd] = useState(null)
  const [revenueStats, setRevenueStats] = useState(null)
  const [filter, setFilter] = useState('all') // all, active, inactive, pending, paid

  // Fetch all ads
  const fetchAds = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.getAllAds(authToken, { status: filter !== 'all' ? filter : undefined })
      setAds(response.data.ads || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch ads')
      console.error('Error fetching ads:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch revenue stats
  const fetchRevenueStats = async () => {
    try {
      const response = await api.getRevenueStats(authToken)
      setRevenueStats(response.data)
    } catch (err) {
      console.error('Error fetching revenue stats:', err)
    }
  }

  useEffect(() => {
    if (authToken) {
      fetchAds()
      fetchRevenueStats()
    }
  }, [authToken, filter])

  // Toggle ad active status
  const handleToggleActive = async (adId, currentStatus) => {
    try {
      await api.toggleAd(adId, authToken)
      fetchAds()
    } catch (err) {
      alert('Failed to toggle ad status: ' + err.message)
    }
  }

  // Delete ad
  const handleDelete = async (adId, title) => {
    if (!window.confirm(`Are you sure you want to delete ad "${title}"? This action cannot be undone.`)) {
      return
    }

    try {
      await api.deleteAd(adId, authToken)
      fetchAds()
      fetchRevenueStats()
    } catch (err) {
      alert('Failed to delete ad: ' + err.message)
    }
  }

  // Mark as paid
  const handleMarkAsPaid = async (adId) => {
    try {
      await api.markAdAsPaid(adId, authToken)
      fetchAds()
      fetchRevenueStats()
    } catch (err) {
      alert('Failed to mark ad as paid: ' + err.message)
    }
  }

  // Handle create new ad
  const handleCreateNew = () => {
    setEditingAd(null)
    setShowAdForm(true)
  }

  // Handle edit ad
  const handleEdit = (ad) => {
    setEditingAd(ad)
    setShowAdForm(true)
  }

  // Handle form close
  const handleFormClose = () => {
    setShowAdForm(false)
    setEditingAd(null)
    fetchAds()
    fetchRevenueStats()
  }

  // Calculate CTR
  const calculateCTR = (impressions, clicks) => {
    if (!impressions || impressions === 0) return '0.00'
    return ((clicks / impressions) * 100).toFixed(2)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ad Manager</h1>
        <p className="text-gray-600">Manage advertisements and track revenue</p>
      </div>

      {/* Revenue Stats */}
      {revenueStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-green-100">Total Revenue</div>
              <DollarSign className="text-green-200" size={24} />
            </div>
            <div className="text-3xl font-bold">
              {Object.entries(revenueStats.totalRevenue).map(([currency, amount]) => (
                <div key={currency}>{currency} {amount.toLocaleString()}</div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-blue-100">Active Ads</div>
              <ToggleRight className="text-blue-200" size={24} />
            </div>
            <div className="text-3xl font-bold">{revenueStats.activeAds}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-purple-100">Pending Payment</div>
              <DollarSign className="text-purple-200" size={24} />
            </div>
            <div className="text-2xl font-bold">{revenueStats.pendingPayments}</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-orange-100">Paid Ads</div>
              <TrendingUp className="text-orange-200" size={24} />
            </div>
            <div className="text-3xl font-bold">{revenueStats.paidAds}</div>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Ads
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'inactive'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Inactive
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending Payment
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'paid'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Paid
          </button>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={20} />
          Create New Ad
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading ads...</p>
        </div>
      ) : (
        <>
          {/* Ads List */}
          {ads.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-lg">No ads found</p>
              <button
                onClick={handleCreateNew}
                className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus size={20} />
                Create Your First Ad
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {ads.map((ad) => (
                <div
                  key={ad._id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Ad Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        {ad.imageUrl && (
                          <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{ad.title}</h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                ad.isActive
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {ad.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                ad.payment?.status === 'paid'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {ad.payment?.status === 'paid' ? 'Paid' : 'Pending'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{ad.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye size={16} />
                              <span>{ad.impressions || 0} impressions</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MousePointer size={16} />
                              <span>{ad.clicks || 0} clicks</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp size={16} />
                              <span>CTR: {calculateCTR(ad.impressions, ad.clicks)}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign size={16} />
                              <span>
                                {ad.pricing?.currency} {ad.pricing?.amount} / {ad.pricing?.period}
                              </span>
                            </div>
                          </div>
                          {ad.advertiser && (
                            <div className="mt-2 text-sm text-gray-500">
                              <span className="font-medium">Advertiser:</span> {ad.advertiser.name} ({ad.advertiser.email})
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap lg:flex-col gap-2">
                      <button
                        onClick={() => handleToggleActive(ad._id, ad.isActive)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          ad.isActive
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {ad.isActive ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
                        {ad.isActive ? 'Deactivate' : 'Activate'}
                      </button>

                      {ad.payment?.status !== 'paid' && (
                        <button
                          onClick={() => handleMarkAsPaid(ad._id)}
                          className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                        >
                          <DollarSign size={18} />
                          Mark as Paid
                        </button>
                      )}

                      <button
                        onClick={() => handleEdit(ad)}
                        className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-colors font-medium"
                      >
                        <Edit2 size={18} />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(ad._id, ad.title)}
                        className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium"
                      >
                        <Trash2 size={18} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Ad Form Modal */}
      {showAdForm && (
        <AdForm
          ad={editingAd}
          authToken={authToken}
          onClose={handleFormClose}
          onSuccess={() => {
            fetchAds()
            fetchRevenueStats()
          }}
        />
      )}
    </div>
  )
}
