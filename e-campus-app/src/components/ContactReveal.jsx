import { useState } from 'react'
import { Phone, Mail, Eye, EyeOff, AlertCircle, MessageCircle } from 'lucide-react'
import { api } from '../services/api'

const ContactReveal = ({ productId, sellerId }) => {
  const [isRevealed, setIsRevealed] = useState(false)
  const [contactInfo, setContactInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleRevealContact = async () => {
    if (isRevealed) {
      // If already revealed, just toggle visibility
      setIsRevealed(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await api.revealContact(productId)

      if (response.status === 'success') {
        setContactInfo(response.data.contact)
        setIsRevealed(true)
      }
    } catch (err) {
      console.error('Error revealing contact:', err)
      setError('Failed to load contact information. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-t pt-6">
      <h3 className="font-semibold text-gray-900 mb-4">Contact Seller</h3>

      {!isRevealed ? (
        <div className="bg-gray-50 rounded-lg p-4">
          <button
            onClick={handleRevealContact}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Eye size={20} />
                <span>Show Contact Information</span>
              </>
            )}
          </button>

          {error && (
            <p className="text-red-600 text-sm mt-3 flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          {/* Contact Information */}
          <div className="space-y-3">
            {/* Seller Name */}
            {contactInfo?.name && (
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="bg-gray-200 p-2 rounded-lg">
                  <MessageCircle size={20} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Seller</p>
                  <p className="text-gray-900 font-semibold">{contactInfo.name}</p>
                  {contactInfo.campus && (
                    <p className="text-xs text-gray-500">{contactInfo.campus}</p>
                  )}
                </div>
              </div>
            )}

            {/* Phone */}
            {contactInfo?.phone && (
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Phone size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Phone</p>
                  <a
                    href={`tel:${contactInfo.phone}`}
                    className="text-blue-600 font-semibold hover:underline block"
                  >
                    {contactInfo.phone}
                  </a>
                </div>
              </div>
            )}

            {/* Email */}
            {contactInfo?.email && (
              <div className="flex items-center gap-3">
                <div className="bg-gray-200 p-2 rounded-lg">
                  <Mail size={20} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Email</p>
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="text-blue-600 font-semibold hover:underline break-all"
                  >
                    {contactInfo.email}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Hide Button */}
          <button
            onClick={() => setIsRevealed(false)}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <EyeOff size={16} />
            <span>Hide Contact Info</span>
          </button>

          {/* Best Practices */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800 font-medium mb-1">📌 Important Notes:</p>
            <ul className="text-xs text-yellow-700 space-y-1 ml-4 list-disc">
              <li>Be respectful and professional when contacting sellers</li>
              <li>All transactions happen outside the app - no in-app purchases</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactReveal
