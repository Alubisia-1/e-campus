import { useState, useEffect } from 'react'
import { Cookie } from 'lucide-react'

/**
 * Cookie consent banner wired to Google Consent Mode.
 *
 * Consent defaults to "denied" in index.html before gtag loads, so Google
 * Analytics stays dormant until the visitor makes a choice here.
 * Accepting flips consent to "granted"; the choice is remembered in
 * localStorage and re-applied on future visits (handled in index.html).
 *
 * Named ConsentBanner, not CookieConsent: ad blockers' "cookie notice" filter
 * lists match any URL containing "cookieconsent", and Vite serves each module
 * at its own path in dev. The blocked import broke the whole module graph and
 * left a blank page. Don't rename it back.
 */
function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show the banner only if the visitor hasn't chosen yet.
    try {
      if (!localStorage.getItem('cookieConsent')) {
        setVisible(true)
      }
    } catch (e) {
      setVisible(true)
    }

    // Allow the banner to be reopened from anywhere (e.g. a "Cookie Settings"
    // footer link) so users can change their choice at any time.
    const reopen = () => setVisible(true)
    window.addEventListener('open-cookie-settings', reopen)
    return () => window.removeEventListener('open-cookie-settings', reopen)
  }, [])

  const updateConsent = (granted) => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      const value = granted ? 'granted' : 'denied'
      window.gtag('consent', 'update', {
        ad_storage: value,
        ad_user_data: value,
        ad_personalization: value,
        analytics_storage: value
      })
    }
  }

  const handleChoice = (granted) => {
    try {
      localStorage.setItem('cookieConsent', granted ? 'granted' : 'denied')
    } catch (e) {
      // Ignore storage failures (private mode); consent still applies this session.
    }
    updateConsent(granted)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-[9999] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white">
            <Cookie size={20} />
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            We use essential cookies to keep CampusMarket working, and optional analytics
            cookies to understand how it's used. Analytics stays <strong>off</strong> unless
            you accept. You can change your choice anytime. See our Cookie Policy in the
            Privacy Policy for details.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => handleChoice(false)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => handleChoice(true)}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConsentBanner
