# CampusMarket Environment Variables Guide

## 🔑 Your Current Admin Password

```
esokostore1@gmail.com
```

**How to use it:**
1. Tap the CampusMarket logo 7 times (mobile) OR press `Ctrl+Shift+A` (desktop)
2. Enter: `esokostore1@gmail.com`
3. Click "Login as Admin"

⚠️ **IMPORTANT:** Change this password to your own secure password!

---

## 📋 All Environment Variables for Deployment

When deploying to **Vercel**, **Railway**, **Netlify**, or any hosting platform, you need to add these environment variables:

### ✅ Required Variables (Frontend):

```bash
# 1. API URL - Your backend server URL
VITE_API_URL=https://e-campus-backend-production.up.railway.app/api

# 2. App Name
VITE_APP_NAME=CampusMarket

# 3. App Version
VITE_APP_VERSION=1.0.0

# 4. Admin Password
VITE_ADMIN_PASSWORD=esokostore1@gmail.com

# 5. Google AdSense Publisher ID
VITE_ADSENSE_CLIENT=ca-pub-7406671560728064

# 6. AdSense Ad Slot IDs (Banner)
VITE_ADSENSE_SLOT_BANNER=7590009154

# 7. AdSense Ad Slot IDs (Sidebar)
VITE_ADSENSE_SLOT_SIDEBAR=6211803712

# 8. AdSense Ad Slot IDs (Footer)
VITE_ADSENSE_SLOT_FOOTER=9858021795

# 9. AdSense Ad Slot IDs (Header)
VITE_ADSENSE_SLOT_HEADER=5611655025

# 10. AdSense Ad Slot IDs (Default)
VITE_ADSENSE_SLOT_DEFAULT=1979531774
```

---

## 🚀 Deployment Instructions

### For Vercel Deployment:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Add Environment Variables**
   - Go to: **Settings** → **Environment Variables**
   - Add each variable below:

| Variable Name | Value |
|--------------|-------|
| `VITE_API_URL` | `https://e-campus-backend-production.up.railway.app/api` |
| `VITE_APP_NAME` | `CampusMarket` |
| `VITE_APP_VERSION` | `1.0.0` |
| `VITE_ADMIN_PASSWORD` | `esokostore1@gmail.com` (or your own) |
| `VITE_ADSENSE_CLIENT` | `ca-pub-7406671560728064` |
| `VITE_ADSENSE_SLOT_BANNER` | `7590009154` |
| `VITE_ADSENSE_SLOT_SIDEBAR` | `6211803712` |
| `VITE_ADSENSE_SLOT_FOOTER` | `9858021795` |
| `VITE_ADSENSE_SLOT_HEADER` | `5611655025` |
| `VITE_ADSENSE_SLOT_DEFAULT` | `1979531774` |

3. **Environment Selection**
   - Select: **Production**, **Preview**, and **Development**
   - This ensures variables work in all environments

4. **Redeploy**
   - Click **Deployments**
   - Click ⋯ menu on latest deployment
   - Click **Redeploy**

---

### For Railway Deployment (Backend):

Your backend is already deployed at:
```
https://e-campus-backend-production.up.railway.app/api
```

If you need to add backend environment variables:

1. **Go to Railway Dashboard**
   - Visit: https://railway.app/dashboard
   - Select: `e-campus-backend-production`

2. **Add Variables**
   - Go to: **Variables** tab
   - Add each variable:

| Variable Name | Value |
|--------------|-------|
| `PORT` | `5000` |
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Your JWT secret key |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `NODE_ENV` | `production` |

---

### For Netlify Deployment:

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com/
   - Select your site

2. **Add Environment Variables**
   - Go to: **Site settings** → **Build & deploy** → **Environment**
   - Click **Edit variables**
   - Add all 10 variables from the list above

3. **Trigger Redeploy**
   - Go to: **Deploys**
   - Click **Trigger deploy** → **Deploy site**

---

## 🔐 Security Recommendations

### Change Your Admin Password:

**Step 1: Generate a Strong Password**

Use a password manager or generator:
- **1Password**: https://1password.com/password-generator/
- **LastPass**: https://www.lastpass.com/features/password-generator
- **Bitwarden**: https://bitwarden.com/password-generator/

**Recommended settings:**
- Length: 16-20 characters
- Include: Uppercase, lowercase, numbers, symbols
- Avoid: Dictionary words, personal info, common patterns

**Example strong passwords:**
```
Xk9@mP3$vL7#qR2!wN8
CampusMarket#2024!MySecret*Admin
Qw7$Rt9@Yp2!Ui3#Op5%As8
```

**Step 2: Update Password Locally**

Edit `e-campus-app/.env`:
```bash
VITE_ADMIN_PASSWORD=YourNewSecurePasswordHere123!
```

**Step 3: Update on Hosting Platform**

- **Vercel**: Settings → Environment Variables → Edit `VITE_ADMIN_PASSWORD`
- **Netlify**: Site settings → Environment → Edit variables
- **Railway**: Not needed (frontend only uses this)

**Step 4: Redeploy**

After changing, redeploy your frontend app.

---

## 🎯 Quick Copy-Paste for Vercel

Copy these one by one and paste into Vercel:

```
VITE_API_URL
https://e-campus-backend-production.up.railway.app/api

VITE_APP_NAME
CampusMarket

VITE_APP_VERSION
1.0.0

VITE_ADMIN_PASSWORD
esokostore1@gmail.com

VITE_ADSENSE_CLIENT
ca-pub-7406671560728064

VITE_ADSENSE_SLOT_BANNER
7590009154

VITE_ADSENSE_SLOT_SIDEBAR
6211803712

VITE_ADSENSE_SLOT_FOOTER
9858021795

VITE_ADSENSE_SLOT_HEADER
5611655025

VITE_ADSENSE_SLOT_DEFAULT
1979531774
```

---

## ✅ Verification Checklist

After adding environment variables:

- [ ] All 10 frontend variables added to hosting platform
- [ ] Admin password changed from default
- [ ] Frontend redeployed after adding variables
- [ ] Can access website
- [ ] Can tap logo 7 times to open admin login
- [ ] Can login with your password
- [ ] See "ADMIN" badge after login
- [ ] AdSense ads appear (if approved by Google)

---

## 🆘 Troubleshooting

### "Incorrect password!" error

**Cause:** Environment variable not set or different from what you entered

**Solution:**
1. Check Vercel/Netlify environment variables
2. Make sure `VITE_ADMIN_PASSWORD` matches what you're typing
3. Redeploy after changing variables
4. Clear browser cache

### Admin login not appearing when tapping logo

**Cause:** JavaScript not loaded or error in code

**Solution:**
1. Open browser console (F12)
2. Look for JavaScript errors
3. Make sure app deployed successfully
4. Try keyboard shortcut: `Ctrl+Shift+A`

### Backend API not connecting

**Cause:** `VITE_API_URL` incorrect or backend down

**Solution:**
1. Check `VITE_API_URL` is correct
2. Test backend: Visit `https://e-campus-backend-production.up.railway.app/api/health`
3. Should see: `{"status":"success","message":"E-Campus API is running"}`
4. Check Railway dashboard - ensure backend is running

---

## 📞 Need Help?

1. **Check your .env file**: `e-campus-app/.env`
2. **Verify deployment variables**: Match your .env file
3. **Test locally first**: `npm run dev`
4. **Check browser console**: F12 → Console tab
5. **Review deployment logs**: On Vercel/Netlify dashboard

---

## 🎉 Summary

**Your Admin Password:**
```
esokostore1@gmail.com
```

**Total Variables Needed:**
- ✅ 10 frontend variables (all start with `VITE_`)
- ✅ Already configured in your .env file
- ✅ Need to add to Vercel/Netlify for deployment

**Access Admin:**
- 📱 Mobile: Tap logo 7 times
- 💻 Desktop: Press `Ctrl+Shift+A`

Good luck with your deployment! 🚀
