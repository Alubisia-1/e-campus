# Google AdSense Setup Guide

## ✅ Implementation Complete!

I've added Google AdSense to your E-Campus Marketplace. Now you need to set up your AdSense account.

---

## 📋 Steps to Activate AdSense

### 1. **Sign Up for Google AdSense**
   - Go to: https://www.google.com/adsense
   - Click "Get Started"
   - Use your Google account to sign up
   - Enter your website URL: (your deployed URL)
   - Fill in payment details

### 2. **Get Your Publisher ID**
   After approval, you'll receive a publisher ID like: `ca-pub-1234567890123456`

### 3. **Update Your App**
   Replace the placeholder in **TWO** files:

   **File 1: `index.html` (line 11)**
   ```html
   <!-- Replace XXXXXXXXXXXXXXXX with your actual publisher ID -->
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
   ```

   **File 2: `src/components/GoogleAdSense.jsx` (line 39)**
   ```jsx
   data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
   ```

### 4. **Create Ad Units in AdSense Dashboard**
   - Log in to AdSense
   - Go to "Ads" → "By ad unit"
   - Create these ad units:

   | Ad Unit Name | Type | Size | Use For |
   |---|---|---|---|
   | Banner Top | Display | 728x90 | Top of page |
   | Sidebar Rectangle | Display | 300x250 | Right sidebar |
   | In-feed Ad | In-feed | Responsive | Between products |
   | Mobile Banner | Display | 320x50 | Mobile bottom |

   - Copy each **Ad Slot ID** (looks like: `1234567890`)

### 5. **Update Ad Slot IDs**
   In `src/components/AdPlacements.jsx`, replace the slot IDs:

   ```jsx
   // Line 15 - BannerAd
   adSlot="YOUR_BANNER_AD_SLOT_ID"

   // Line 26 - SidebarAd
   adSlot="YOUR_SIDEBAR_AD_SLOT_ID"

   // Line 37 - InFeedAd
   adSlot="YOUR_INFEED_AD_SLOT_ID"

   // Line 48 - MobileBannerAd
   adSlot="YOUR_MOBILE_AD_SLOT_ID"

   // Line 59 - ResponsiveAd
   adSlot="YOUR_RESPONSIVE_AD_SLOT_ID"
   ```

---

## 💰 How to Use the Ad Components

### Option 1: Add to App.jsx

```jsx
import { BannerAd, SidebarAd, InFeedAd, MobileBannerAd } from './components/AdPlacements'

function App() {
  return (
    <div>
      {/* Top banner */}
      <BannerAd />

      <div className="flex">
        {/* Main content */}
        <main>
          {/* Products grid */}
          {products.map((product, index) => (
            <>
              <ProductCard product={product} />

              {/* Show ad every 6 products */}
              {(index + 1) % 6 === 0 && <InFeedAd />}
            </>
          ))}
        </main>

        {/* Sidebar with ads */}
        <aside>
          <SidebarAd />
        </aside>
      </div>

      {/* Mobile sticky banner */}
      <MobileBannerAd />
    </div>
  )
}
```

### Option 2: Strategic Placement Ideas

**High Revenue Spots:**
- ✅ Top of homepage (BannerAd)
- ✅ Above product listings (BannerAd)
- ✅ Right sidebar on all pages (SidebarAd)
- ✅ Between products every 6 items (InFeedAd)
- ✅ Bottom of product detail pages (ResponsiveAd)
- ✅ Mobile sticky bottom (MobileBannerAd)

---

## 📊 Expected Revenue

With **1000 daily visitors**:
- **CPM**: $2-5 per 1000 impressions
- **CTR**: 1-3% (clicks per view)
- **Monthly**: $100-500

With **5000 daily visitors**:
- **Monthly**: $500-2500

---

## ⚠️ Important Notes

1. **AdSense Approval Takes Time**
   - Usually 1-2 weeks
   - Need quality content and traffic
   - Site must be fully deployed (not localhost)

2. **Policy Compliance**
   - No clicking your own ads
   - No adult/illegal content
   - Must have privacy policy
   - Must disclose cookie usage

3. **Ads Won't Show on Localhost**
   - Only work on live/deployed sites
   - Test using development mode after deployment

4. **Optimize Placement**
   - Don't overload with ads (hurts user experience)
   - Recommended: 3-4 ads per page maximum
   - Higher viewability = higher revenue

---

## 🚀 Next Steps

1. ✅ Sign up for Google AdSense
2. ✅ Get approved (requires deployed site)
3. ✅ Replace publisher ID in code
4. ✅ Create ad units and get slot IDs
5. ✅ Update slot IDs in AdPlacements.jsx
6. ✅ Deploy and test

---

## 🆘 Troubleshooting

**Ads not showing?**
- Check browser console for errors
- Verify publisher ID is correct
- Ensure site is deployed (not localhost)
- Wait 24-48 hours after adding code
- Check if AdBlock is enabled

**Low revenue?**
- Increase traffic (SEO, marketing)
- Improve ad placement (above the fold)
- Use responsive ad formats
- Enable auto ads in AdSense dashboard

---

## 📞 Need Help?

- AdSense Help: https://support.google.com/adsense
- Community: https://support.google.com/adsense/community

Good luck with your monetization! 💰
