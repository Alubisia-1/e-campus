# E-Soko Backend Deployment to Render

## 🚨 URGENT: Deploy to Fix CORS Errors

Your backend code has been updated but **NOT deployed to Render yet**. This is why you're seeing CORS errors.

---

## 📋 Pre-Deployment Checklist

### Required Environment Variables for Render

You MUST set these environment variables on Render:

```bash
# Database
MONGODB_URI=mongodb+srv://zebedeealubisia374_db_user:gAeRwmvaCryV8GJN@cluster0.62wlulk.mongodb.net/ecampus?retryWrites=true&w=majority&appName=Cluster0

# JWT Secret (generate a new one or use existing)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string-min-32-chars

# JWT Expiration
JWT_EXPIRE=30d

# Admin Password (bcrypt hashed - DO NOT CHANGE THE HASH)
ADMIN_PASSWORD=$2b$10$Bej4dltyFSrEhgXtf3z14O0YoauEOnNWznL7AQWO06YA8f/uPmzHq

# Frontend URL for CORS
FRONTEND_URL=https://www.e-soko.store

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Node Environment
NODE_ENV=production

# Port (Render sets this automatically, but you can specify)
PORT=5000
```

---

## 🚀 Deployment Steps

### Option 1: Automatic Deployment (If GitHub Connected)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Login to your account

2. **Find Your Backend Service**
   - Look for: `e-campus-backend-phlz`
   - Click on it

3. **Check Auto-Deploy Status**
   - If "Auto-Deploy" is enabled:
     - It should deploy automatically from GitHub
     - Wait 3-5 minutes for deployment to complete
   - If "Auto-Deploy" is disabled:
     - Click "Manual Deploy" button
     - Select "Deploy latest commit"
     - Click "Deploy"

4. **Add Missing Environment Variables**
   - Click "Environment" tab (left sidebar)
   - Check which variables are missing
   - Add the ones listed above (especially `ADMIN_PASSWORD`)
   - Click "Save Changes" after each addition
   - Service will redeploy automatically

### Option 2: Manual Git Push to Render

If you set up Render with Git push:

```bash
# Make sure you're in the backend directory
cd /home/zeb/e-campus/e-campus-backend

# Add Render remote (if not already added)
# Get the git URL from Render Dashboard > Settings > Build & Deploy
git remote add render <YOUR_RENDER_GIT_URL>

# Push to Render
git push render main
```

---

## ✅ Verify Deployment

### 1. Check Deployment Status

In Render Dashboard:
- **Events** tab: Shows deployment progress
- **Logs** tab: Shows real-time server logs
- Look for: `"✅ MongoDB connected successfully"`
- Look for: `"Server started on port 5000"`

### 2. Test API Endpoints

Once deployed, test these URLs in your browser:

**Health Check:**
```
https://e-campus-backend-phlz.onrender.com/health
```

Should return:
```json
{
  "status": "success",
  "message": "E-Campus API is running",
  "timestamp": "2025-01-06T..."
}
```

**Root Endpoint:**
```
https://e-campus-backend-phlz.onrender.com/
```

Should return list of endpoints including `/api/admin`

**Test CORS (from browser console on your site):**
```javascript
fetch('https://e-campus-backend-phlz.onrender.com/api/categories')
  .then(r => r.json())
  .then(console.log)
```

Should return categories without CORS error.

### 3. Test Admin Login

On your site (https://www.e-soko.store):
1. Press `Ctrl + Shift + A`
2. Enter password: `Mylifeline8`
3. Should successfully login without errors

---

## 🔧 Troubleshooting

### Issue: "CORS policy" error

**Cause:** Backend not deployed or CORS origins not configured

**Solution:**
1. Verify deployment completed successfully
2. Check `FRONTEND_URL` environment variable is set
3. Check Render logs for any startup errors

### Issue: "500 Internal Server Error"

**Cause:** Missing environment variables or database connection issues

**Solution:**
1. Check Render logs: Dashboard > Logs tab
2. Verify all environment variables are set
3. Verify MongoDB connection string is correct
4. Look for error messages in logs

### Issue: "Admin password not configured"

**Cause:** `ADMIN_PASSWORD` environment variable not set

**Solution:**
1. Go to Render > Environment tab
2. Add variable:
   - Key: `ADMIN_PASSWORD`
   - Value: `$2b$10$Bej4dltyFSrEhgXtf3z14O0YoauEOnNWznL7AQWO06YA8f/uPmzHq`
3. Save and wait for redeploy

### Issue: Deployment failing

**Check Render Logs for:**
- Missing dependencies: Run `npm install` locally and commit `package-lock.json`
- Node version issues: Render uses Node 18+
- MongoDB connection errors: Verify connection string
- Missing environment variables

---

## 📊 Post-Deployment Verification

After successful deployment:

- [ ] Health endpoint returns 200 OK
- [ ] Categories endpoint works (no CORS error)
- [ ] Products endpoint works (no CORS error)
- [ ] Admin login works with password `Mylifeline8`
- [ ] No errors in Render logs
- [ ] Frontend can connect to all API endpoints

---

## 🔐 Security Notes

**IMPORTANT:**
- Never commit `.env` file to Git (it's in `.gitignore`)
- `ADMIN_PASSWORD` value is a bcrypt hash (already secure)
- Keep your MongoDB connection string secret
- Rotate JWT secret periodically for production

---

## 📞 Need Help?

If deployment fails:
1. Check Render logs for specific error messages
2. Verify all environment variables are set correctly
3. Test MongoDB connection separately
4. Ensure GitHub repository is up to date

---

## Current Backend Status

**Last Code Update:** Just now (admin auth implementation)
**Deployed Version:** OLD (needs deployment)
**Required Action:** DEPLOY NOW to Render
