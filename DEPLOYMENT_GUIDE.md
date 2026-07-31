# E-Campus Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Environment Variables

#### Frontend (.env)
Create `e-campus-app/.env` file:
```bash
VITE_API_URL=https://your-backend-url.com/api
VITE_APP_NAME=E-Campus Marketplace
VITE_APP_VERSION=1.0.0
VITE_ADMIN_PASSWORD=your_secure_password
```

#### Backend (.env)
Update `e-campus-backend/.env` with production values:
```bash
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/e-campus
JWT_SECRET=generate_a_strong_32_char_secret
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=https://your-frontend-url.com
OFFICIAL_STORE_EMAIL=support@bigminds.online
OFFICIAL_STORE_PHONE=+1-555-XXX-XXXX
```

### 2. Generate Secure Secrets

**JWT Secret (Run in terminal):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Database Setup

1. **Create MongoDB Atlas Account:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Create a database user
   - Whitelist your IP (or use 0.0.0.0/0 for all IPs)
   - Get your connection string

2. **Update Connection String:**
   - Replace username, password, and cluster URL in MONGODB_URI

### 4. Cloudinary Setup (Image Uploads)

1. **Sign up at:** https://cloudinary.com
2. **Get credentials from:** Dashboard → Account Details
3. **Update .env** with your Cloud Name, API Key, and API Secret

### 5. Update Contact Information

Replace placeholder contact info in the app:
- In `e-campus-app/src/App.jsx` (lines 412-446)
- Update email: `support@bigminds.online` → your real email
- Update phone: `+1 (555) 123-4567` → your real phone

---

## 🚀 Deployment Options

### Option 1: Deploy to Vercel (Frontend) + Render/Railway (Backend)

#### Frontend (Vercel):
```bash
cd e-campus-app
npm run build
# Deploy dist folder to Vercel
```

**Vercel Setup:**
1. Import GitHub repository
2. Set framework preset: Vite
3. Add environment variables
4. Deploy

#### Backend (Render/Railway):
1. Push code to GitHub
2. Create new Web Service on Render.com or Railway.app
3. Connect repository
4. Add environment variables
5. Set build command: `npm install`
6. Set start command: `npm start`

### Option 2: Deploy to Single Server (VPS)

**Requirements:**
- Ubuntu 20.04+ or similar
- Node.js 18+
- Nginx (for reverse proxy)
- PM2 (for process management)

**Setup:**
```bash
# Install dependencies
sudo apt update
sudo apt install nodejs npm nginx

# Install PM2
npm install -g pm2

# Clone repository
git clone your-repo-url
cd e-campus

# Setup backend
cd e-campus-backend
npm install
cp .env.production.example .env
# Edit .env with your values
pm2 start server.js --name e-campus-api

# Setup frontend
cd ../e-campus-app
npm install
npm run build
# Serve dist folder with Nginx
```

**Nginx Configuration:**
```nginx
# Frontend
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/e-campus-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Backend API
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔒 Security Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Update admin password from default
- [ ] Enable HTTPS (use Let's Encrypt)
- [ ] Update CORS origins to production domains only
- [ ] Remove console.logs from production code
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Enable MongoDB authentication
- [ ] Review and test all security headers

---

## 📝 Post-Deployment

1. **Test all features:**
   - User registration/login
   - Product listing/viewing
   - Image uploads
   - Search functionality
   - Official store products

2. **Monitor:**
   - Check server logs
   - Monitor database connections
   - Watch for errors

3. **Backup:**
   - Set up automated database backups
   - Keep .env files secure (never commit to git)

---

## 🆘 Troubleshooting

**CORS Errors:**
- Verify FRONTEND_URL in backend .env
- Check CORS configuration in server.js

**Database Connection Failed:**
- Verify MongoDB URI
- Check IP whitelist in MongoDB Atlas
- Ensure network access is configured

**Images Not Uploading:**
- Verify Cloudinary credentials
- Check file size limits
- Review upload route permissions

**API Not Responding:**
- Check if backend server is running
- Verify API_URL in frontend .env
- Review firewall/security group settings

---

## 📞 Support

For issues or questions, refer to:
- Backend API Documentation: `/e-campus-backend/API_DOCUMENTATION.md`
- Products API: `/e-campus-backend/PRODUCTS_API.md`
