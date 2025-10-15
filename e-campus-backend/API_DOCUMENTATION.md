# E-Campus API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### 1. Register User
**POST** `/auth/register`

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "whatsapp": "+1234567890",
  "campus": "Main Campus"
}
```

**Required Fields:**
- `name` (2-50 characters)
- `email` (valid email)
- `password` (minimum 6 characters)

**Optional Fields:**
- `phone`
- `whatsapp`
- `campus`

**Success Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "whatsapp": "+1234567890",
      "campus": "Main Campus",
      "isVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "User with this email already exists"
}
```

---

### 2. Login User
**POST** `/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Required Fields:**
- `email` (valid email)
- `password`

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "whatsapp": "+1234567890",
      "campus": "Main Campus",
      "isVerified": false,
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "status": "error",
  "message": "Invalid email or password"
}
```

---

### 3. Get Current User
**GET** `/auth/me`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "whatsapp": "+1234567890",
      "campus": "Main Campus",
      "avatar": "",
      "bio": "",
      "isVerified": false,
      "role": "user",
      "listings": [],
      "savedProducts": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Response (401):**
```json
{
  "status": "error",
  "message": "Not authorized to access this route"
}
```

---

### 4. Update User Profile
**PUT** `/auth/profile`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "+1234567890",
  "whatsapp": "+1234567890",
  "campus": "North Campus",
  "bio": "Computer Science student"
}
```

**All Fields Optional:**
- `name`
- `phone`
- `whatsapp`
- `campus`
- `bio`

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Smith",
      "email": "john@example.com",
      "phone": "+1234567890",
      "whatsapp": "+1234567890",
      "campus": "North Campus",
      "bio": "Computer Science student",
      "isVerified": false,
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## Upload Endpoints

### 1. Upload Product Images
**POST** `/upload/product-images`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `images` - Image files (max 3 files)
- Accepted formats: JPG, JPEG, PNG, WebP
- Max file size: 5MB per image
- Images will be optimized to max 1200x1200px, 80% quality, WebP format

**Success Response (200):**
```json
{
  "status": "success",
  "message": "3 image(s) uploaded successfully",
  "data": {
    "images": [
      {
        "url": "https://res.cloudinary.com/...",
        "publicId": "ecampus/products/userId_timestamp_0",
        "width": 1200,
        "height": 900,
        "format": "webp",
        "size": 156789
      },
      {
        "url": "https://res.cloudinary.com/...",
        "publicId": "ecampus/products/userId_timestamp_1",
        "width": 1200,
        "height": 800,
        "format": "webp",
        "size": 145632
      }
    ]
  }
}
```

**Error Responses:**
- **400** - No files uploaded / Too many files / File too large / Invalid format
- **401** - Not authenticated

---

### 2. Upload Avatar
**POST** `/upload/avatar`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `avatar` - Single image file
- Accepted formats: JPG, JPEG, PNG, WebP
- Max file size: 5MB
- Image will be cropped to 500x500px square

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Avatar uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "ecampus/avatars/avatar_userId"
  }
}
```

---

### 3. Delete Image
**DELETE** `/upload/image/:publicId`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `publicId` - Cloudinary public ID of image (URL encoded)

**Example:**
```
DELETE /api/upload/image/ecampus%2Fproducts%2FuserId_timestamp_0
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Image deleted successfully"
}
```

**Error Response (404):**
```json
{
  "status": "error",
  "message": "Image not found or already deleted"
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (authentication failed) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Token Expiration

JWT tokens expire after **30 days**. After expiration, users need to login again to get a new token.

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "campus": "Main Campus"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Profile
```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "bio": "CS Student"
  }'
```

---

## Notes

- Passwords are automatically hashed using bcryptjs before storage
- Password field is excluded from all JSON responses
- Email addresses are stored in lowercase
- Email must be unique across all users
- Token must be included in Authorization header as "Bearer {token}"
