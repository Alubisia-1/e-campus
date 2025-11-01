# AdSense Quick Start ⚡

## 🚀 3-Step Setup (5 minutes)

### Step 1: Get AdSense Account
1. Visit https://www.google.com/adsense/
2. Sign up & get approved (1-2 weeks)
3. Get your **Publisher ID**: `ca-pub-XXXXXXXXXXXXXXXX`

### Step 2: Create Ad Units
1. In AdSense dashboard: **Ads → By ad unit → New ad unit**
2. Create 5 responsive ad units (Banner, Sidebar, Footer, Header, Default)
3. Copy each **Ad Slot ID** (10-digit number)

### Step 3: Configure Your App

**A) Update `index.html` (line 12):**
```html
<!-- Replace XXXXXXXXXXXXXXXX with your Publisher ID -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ID_HERE"
```

**B) Create `.env` file:**
```bash
cd /home/zeb/e-campus/e-campus-app
cp .env.example .env
nano .env
```

**C) Add your IDs to `.env`:**
```bash
VITE_ADSENSE_CLIENT=ca-pub-YOUR_PUBLISHER_ID
VITE_ADSENSE_SLOT_BANNER=YOUR_BANNER_SLOT_ID
VITE_ADSENSE_SLOT_SIDEBAR=YOUR_SIDEBAR_SLOT_ID
VITE_ADSENSE_SLOT_FOOTER=YOUR_FOOTER_SLOT_ID
VITE_ADSENSE_SLOT_HEADER=YOUR_HEADER_SLOT_ID
VITE_ADSENSE_SLOT_DEFAULT=YOUR_DEFAULT_SLOT_ID
```

**D) Restart dev server:**
```bash
npm run dev
```

---

## 📍 Where to Find Your IDs

### Publisher ID (Client ID):
1. AdSense Dashboard → **Account → Settings**
2. Look for: `ca-pub-1234567890123456`
3. **16 digits** after `ca-pub-`

### Ad Slot IDs:
1. AdSense Dashboard → **Ads → By ad unit**
2. Click on any ad unit
3. Look in the code snippet for: `data-ad-slot="1234567890"`
4. **10-digit number**

---

## ✅ Verification Checklist

Before deploying:
- [ ] Publisher ID in `index.html` (no `XXXX`)
- [ ] All 5 slot IDs in `.env` file
- [ ] `.env` file exists (not just `.env.example`)
- [ ] Dev server restarted
- [ ] No "AdSense Placeholder" boxes showing
- [ ] No console errors (F12)

---

## 💰 How Hybrid Ads Work

```
User visits page
     ↓
Check: Do we have direct ads in database?
     ↓
   YES ───→ Show YOUR custom ad (100% revenue!)
   NO  ───→ Show Google AdSense (passive income)
```

**Result:** No empty ad spaces = Maximum revenue!

---

## 📊 Expected Revenue

### AdSense Passive Income:
- **100 daily visitors:** ~$1-5/day
- **1,000 daily visitors:** ~$10-50/day
- **10,000 daily visitors:** ~$100-500/day

### Direct Ad Sales (Your Custom Ads):
- **Banner ads:** $50-200/month each
- **Sidebar ads:** $30-100/month each
- **Sponsored products:** $10-50/month each

### Combined Potential:
**Small campus site (500 users/day):** $200-800/month
**Large campus site (5,000 users/day):** $1,500-5,000/month

---

## 🆘 Quick Troubleshooting

**Problem:** "AdSense Placeholder" showing
- **Fix:** Update IDs in `index.html` and `.env`, restart server

**Problem:** Ads not showing
- **Fix:** Wait 24-48 hours after deployment, ads don't show on localhost

**Problem:** Console errors
- **Fix:** Check all IDs are correct, no typos, no `XXXX` remaining

**Problem:** Account not approved
- **Fix:** Wait 1-2 weeks, ensure quality content, no prohibited content

---

## 📱 Contact & Resources

**Full Guide:** See `ADSENSE_SETUP_GUIDE.md`
**AdSense Dashboard:** https://www.google.com/adsense/
**Support:** https://support.google.com/adsense/

---

## 🎯 Next Steps

1. **Sign up for AdSense** (if not done)
2. **Configure IDs** (follow Step 3 above)
3. **Deploy to production**
4. **Wait for approval & ads to appear**
5. **Start earning!** 💰

**Remember:** Never click your own ads! Google will ban your account.
