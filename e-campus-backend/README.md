# E-Campus Marketplace - Backend API

A comprehensive RESTful API for a campus marketplace platform where students can buy and sell items, upload products, manage listings, and interact with advertisements.

## 🚀 Features

- **User Authentication** - JWT-based authentication with secure password hashing
- **Product Management** - CRUD operations for products with image uploads
- **Category System** - Organize products by categories
- **Image Upload** - Cloudinary integration with Sharp optimization (WebP format)
- **Advertisement System** - Display and track ad impressions and clicks
- **Search & Filter** - Advanced product search with filtering options
- **Security** - Helmet, rate limiting, input validation, XSS & NoSQL injection protection
- **Error Handling** - Comprehensive error handling middleware

## 🛠 Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB (MongoDB Atlas)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Image Processing**: Sharp
- **Cloud Storage**: Cloudinary
- **Validation**: express-validator
- **Security**: Helmet, express-rate-limit, express-mongo-sanitize, xss-clean

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** version 16 or higher
- **MongoDB Atlas** account (or local MongoDB instance)
- **Cloudinary** account for image hosting
- **npm** or **yarn** package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd e-campus-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Fill in all required environment variables (see Environment Variables section)

4. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000` (or your configured PORT)

## 🌍 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5174

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecampus?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRE=30d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Environment Variable Descriptions

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `development` or `production` |
| `PORT` | Server port number | `5000` |
| `FRONTEND_URL` | Frontend application URL for CORS | `http://localhost:5174` |
| `MONGODB_URI` | MongoDB connection string | Get from MongoDB Atlas |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) | Use a strong random string |
| `JWT_EXPIRE` | JWT token expiration time | `30d` (30 days) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | From Cloudinary dashboard |

## 📁 Project Structure

```
e-campus-backend/
├── src/
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js    # Authentication logic
│   │   ├── product.controller.js # Product CRUD operations
│   │   ├── upload.controller.js  # Image upload handling
│   │   └── advertisement.controller.js # Ad management
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT verification
│   │   ├── upload.middleware.js  # Multer configuration
│   │   ├── errorHandler.js       # Global error handling
│   │   ├── rateLimiter.js        # Rate limiting config
│   │   └── asyncHandler.js       # Async error wrapper
│   ├── models/
│   │   ├── User.model.js         # User schema
│   │   ├── Product.model.js      # Product schema
│   │   ├── Category.model.js     # Category schema
│   │   └── Advertisement.model.js # Advertisement schema
│   ├── routes/
│   │   ├── auth.routes.js        # Auth endpoints
│   │   ├── product.routes.js     # Product endpoints
│   │   ├── upload.routes.js      # Upload endpoints
│   │   ├── category.routes.js    # Category endpoints
│   │   └── advertisement.routes.js # Ad endpoints
│   └── utils/
│       ├── imageOptimizer.js     # Sharp image processing
│       ├── cloudinary.js         # Cloudinary configuration
│       └── validators.js         # Validation utilities
├── scripts/
│   └── seed.js                   # Database seeding script
├── server.js                     # Entry point
├── .env.example                  # Environment template
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user | Yes |
| PUT | `/profile` | Update user profile | Yes |

### Products (`/api/products`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all products (with filters) | No |
| GET | `/search` | Search products | No |
| GET | `/:id` | Get single product | No |
| POST | `/` | Create new product | Yes |
| PUT | `/:id` | Update product | Yes (owner) |
| DELETE | `/:id` | Delete product | Yes (owner) |
| GET | `/user/my-listings` | Get user's products | Yes |

### Upload (`/api/upload`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/product-images` | Upload product images (max 3) | Yes |
| POST | `/avatar` | Upload user avatar | Yes |
| DELETE | `/image/:publicId` | Delete image from Cloudinary | Yes |

### Categories (`/api/categories`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all categories | No |
| GET | `/:id` | Get single category | No |

### Advertisements (`/api/ads`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get active ads | No |
| GET | `/:id` | Get single ad | No |
| POST | `/:id/impression` | Track ad impression | No |
| GET | `/:id/click` | Track click & redirect | No |
| GET | `/:id/stats` | Get ad statistics | No |

## 🔒 Security Features

1. **Helmet** - Sets secure HTTP headers with Content Security Policy
2. **Rate Limiting** - Prevents brute force attacks
   - General API: 100 requests per 15 minutes
   - Auth endpoints: 5 requests per 15 minutes
   - Upload endpoints: 10 requests per hour
   - Product creation: 20 products per day
   - Search: 50 searches per 15 minutes
3. **Input Validation** - express-validator on all routes
4. **XSS Protection** - xss-clean middleware
5. **NoSQL Injection Prevention** - express-mongo-sanitize
6. **CORS** - Configured for frontend origin only
7. **Password Hashing** - bcryptjs with 10 salt rounds
8. **JWT Authentication** - Secure token-based authentication

## 📊 Database Seeding

To populate the database with sample data:

```bash
npm run seed
```

This will create:
- Sample categories (Electronics, Books, Clothing, etc.)
- Admin user account
- Sample products
- Sample advertisements

**Warning**: This will clear existing data. Only use in development!

## 🚦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm run seed` | Seed database with sample data |

## 📝 API Response Format

### Success Response
```json
{
  "status": "success",
  "data": { ... },
  "count": 10
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required",
      "value": ""
    }
  ]
}
```

## 🧪 Testing the API

You can test the API using:
- **Postman** - Import endpoints and test manually
- **Thunder Client** - VS Code extension
- **cURL** - Command line testing

Example cURL request:
```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

## 🐛 Error Handling

The API includes comprehensive error handling for:
- Mongoose validation errors
- MongoDB duplicate key errors
- JWT authentication errors
- Multer file upload errors
- Cloudinary upload errors
- Express validation errors

All errors return appropriate HTTP status codes and descriptive messages.

## 🔄 Database Models

### User Model
- name, email, password (hashed)
- phone, whatsapp, campus
- avatar (Cloudinary URL)
- isVerified, role
- timestamps

### Product Model
- title, description, price
- category (ref), seller (ref)
- condition, status
- images (array with URL and publicId)
- location (campus, building)
- views, tags
- timestamps

### Category Model
- name, slug
- description
- icon, color
- productCount
- timestamps

### Advertisement Model
- company, message, link
- type, position
- isActive, startDate, endDate
- impressions, clicks
- imageUrl, priority
- timestamps

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Support

For support, email support@bigminds.online or create an issue in the repository.

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- Cloudinary for image hosting services
- MongoDB team for the database solution
- All open-source contributors
