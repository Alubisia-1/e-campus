# E-Campus Marketplace

A full-stack marketplace application designed for campus communities to buy and sell items. Built with React (Vite), Node.js, Express, and MongoDB.

## Features

- **User Authentication**: Secure JWT-based authentication
- **Product Management**: List, browse, search, and filter products
- **Image Upload**: Cloudinary integration for product images
- **Official Store**: Special section for campus official store products
- **Categories**: Organized product categories (Books, Electronics, Furniture, etc.)
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Real-time Search**: Search products by title, description, or seller
- **Admin Dashboard**: Manage products and official store listings

## Tech Stack

### Frontend
- React 19 with Vite
- Tailwind CSS
- Lucide React Icons
- Axios for API calls

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT for authentication
- Cloudinary for image storage
- Helmet, CORS, Rate Limiting for security

## Project Structure

```
e-campus/
├── e-campus-app/          # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main application component
│   │   └── services/
│   │       └── api.js     # API service layer
│   ├── .env.example       # Environment variables template
│   └── package.json
│
├── e-campus-backend/      # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   └── config/        # Configuration files
│   ├── .env.example       # Environment variables template
│   └── package.json
│
├── DEPLOYMENT_GUIDE.md    # Detailed deployment instructions
└── README.md              # This file
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd e-campus
```

2. **Setup Backend**
```bash
cd e-campus-backend
npm install
cp .env.example .env
# Edit .env with your configuration (see below)
npm run dev
```

3. **Setup Frontend**
```bash
cd e-campus-app
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Environment Configuration

#### Backend (.env)
```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5174
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=E-Campus Marketplace
VITE_APP_VERSION=1.0.0
VITE_ADMIN_PASSWORD=your_secure_password
```

## API Documentation

See `e-campus-backend/API_DOCUMENTATION.md` for detailed API endpoints.

Key endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product (authenticated)
- `POST /api/upload` - Upload product images

## Deployment

See `DEPLOYMENT_GUIDE.md` for complete deployment instructions.

### Quick Deployment Options

1. **Vercel (Frontend) + Render (Backend)**
   - Push code to GitHub
   - Import to Vercel (frontend) and Render (backend)
   - Configure environment variables
   - Deploy

2. **VPS/Cloud Server**
   - Use PM2 for process management
   - Nginx as reverse proxy
   - MongoDB Atlas for database
   - Let's Encrypt for SSL

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (32+ characters)
- [ ] Configure MongoDB authentication
- [ ] Enable HTTPS in production
- [ ] Set CORS to production domain only
- [ ] Keep `.env` files out of version control
- [ ] Set up database backups
- [ ] Review rate limiting settings

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues or questions:
- Check the `DEPLOYMENT_GUIDE.md` for common troubleshooting
- Review API documentation in `e-campus-backend/`
- Open an issue on GitHub

## Acknowledgments

- Built with React, Node.js, Express, and MongoDB
- UI components styled with Tailwind CSS
- Icons from Lucide React
