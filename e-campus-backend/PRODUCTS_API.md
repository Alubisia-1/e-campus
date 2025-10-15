# Products API Documentation

## Product Endpoints

### 1. Get All Products (with filters and pagination)
**GET** `/api/products`

**Access:** Public

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 12) - Items per page
- `category` - Filter by category ID
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `search` - Search in title, description, tags (case-insensitive)
- `condition` - Filter by condition (New, Like New, Excellent, Good, Fair)
- `status` (default: available) - Filter by status

**Example Request:**
```
GET /api/products?page=1&limit=12&category=507f1f77bcf86cd799439011&minPrice=10&maxPrice=100&search=textbook&condition=Like%20New
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Calculus Textbook - 10th Edition",
        "description": "Barely used calculus textbook...",
        "price": 45.00,
        "category": {
          "_id": "507f191e810c19729de860ea",
          "name": "Textbooks",
          "slug": "textbooks"
        },
        "condition": "Like New",
        "images": [
          {
            "url": "https://res.cloudinary.com/...",
            "publicId": "ecampus/products/..."
          }
        ],
        "seller": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Sarah M.",
          "phone": "+1234567890",
          "email": "sarah@campus.edu",
          "whatsapp": "+1234567890",
          "campus": "Main Campus",
          "avatar": "https://..."
        },
        "status": "available",
        "location": {
          "campus": "Main Campus",
          "building": "Science Building"
        },
        "views": 45,
        "tags": ["math", "calculus", "textbook"],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "pages": 4,
      "limit": 12
    }
  }
}
```

---

### 2. Get Product by ID
**GET** `/api/products/:id`

**Access:** Public

**URL Parameters:**
- `id` - Product ObjectId

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "product": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Calculus Textbook - 10th Edition",
      "description": "Barely used calculus textbook. No highlighting or writing inside.",
      "price": 45.00,
      "category": {
        "_id": "507f191e810c19729de860ea",
        "name": "Textbooks",
        "slug": "textbooks",
        "description": "Educational books and materials"
      },
      "condition": "Like New",
      "images": [
        {
          "url": "https://res.cloudinary.com/...",
          "publicId": "ecampus/products/..."
        }
      ],
      "seller": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Sarah M.",
        "phone": "+1234567890",
        "email": "sarah@campus.edu",
        "whatsapp": "+1234567890",
        "campus": "Main Campus",
        "avatar": "https://...",
        "bio": "Engineering student selling textbooks",
        "createdAt": "2023-09-01T00:00:00.000Z"
      },
      "status": "available",
      "location": {
        "campus": "Main Campus",
        "building": "Science Building"
      },
      "views": 46,
      "savedBy": [],
      "tags": ["math", "calculus", "textbook"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  }
}
```

**Note:** View count is automatically incremented when product is viewed.

**Error Response (404):**
```json
{
  "status": "error",
  "message": "Product not found"
}
```

---

### 3. Create Product
**POST** `/api/products`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "MacBook Pro 2020 - 13 inch",
  "description": "MacBook Pro 13\" 2020 model. 8GB RAM, 256GB SSD. Works perfectly, minor scratches on body.",
  "price": 899.00,
  "category": "507f191e810c19729de860ea",
  "condition": "Good",
  "images": [
    {
      "url": "https://res.cloudinary.com/...",
      "publicId": "ecampus/products/userId_timestamp_0"
    },
    {
      "url": "https://res.cloudinary.com/...",
      "publicId": "ecampus/products/userId_timestamp_1"
    }
  ],
  "location": {
    "campus": "Main Campus",
    "building": "Tech Hub"
  },
  "tags": ["laptop", "apple", "macbook", "electronics"]
}
```

**Required Fields:**
- `title` (5-100 characters)
- `description` (10-2000 characters)
- `price` (positive number)
- `category` (valid MongoDB ObjectId)
- `condition` (New, Like New, Excellent, Good, Fair)
- `images` (array of 1-3 image objects with url and optional publicId)

**Optional Fields:**
- `location.campus`
- `location.building`
- `tags` (array of strings)

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Product created successfully",
  "data": {
    "product": {
      "_id": "507f1f77bcf86cd799439013",
      "title": "MacBook Pro 2020 - 13 inch",
      "description": "MacBook Pro 13\" 2020 model...",
      "price": 899.00,
      "category": {
        "_id": "507f191e810c19729de860ea",
        "name": "Electronics"
      },
      "condition": "Good",
      "images": [...],
      "seller": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John D.",
        ...
      },
      "status": "available",
      "views": 0,
      "createdAt": "2024-01-03T00:00:00.000Z"
    }
  }
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "errors": [
    {
      "msg": "Product title is required",
      "param": "title",
      "location": "body"
    }
  ]
}
```

---

### 4. Update Product
**PUT** `/api/products/:id`

**Access:** Private (requires authentication, owner only)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `id` - Product ObjectId

**Request Body** (all fields optional):
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "price": 799.00,
  "category": "507f191e810c19729de860ea",
  "condition": "Excellent",
  "status": "reserved",
  "location": {
    "campus": "North Campus",
    "building": "Building A"
  },
  "tags": ["updated", "tags"]
}
```

**Allowed Fields to Update:**
- `title` (5-100 characters)
- `description` (10-2000 characters)
- `price` (positive number)
- `category` (valid ObjectId)
- `condition` (New, Like New, Excellent, Good, Fair)
- `status` (available, sold, reserved, inactive)
- `location`
- `tags`

**Note:** Seller and images cannot be updated via this endpoint.

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Product updated successfully",
  "data": {
    "product": {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Updated Title",
      ...
    }
  }
}
```

**Error Responses:**
- **404** - Product not found
- **403** - Not authorized to update this product

---

### 5. Delete Product
**DELETE** `/api/products/:id`

**Access:** Private (requires authentication, owner or admin)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` - Product ObjectId

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Product deleted successfully"
}
```

**Note:**
- Automatically deletes associated images from Cloudinary
- Removes product from user's listings array
- Only product owner or admin can delete

**Error Responses:**
- **404** - Product not found
- **403** - Not authorized to delete this product

---

### 6. Search Products
**GET** `/api/products/search`

**Access:** Public

**Query Parameters:**
- `q` (required) - Search query
- `page` (default: 1) - Page number
- `limit` (default: 12) - Items per page

**Example Request:**
```
GET /api/products/search?q=laptop&page=1&limit=12
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "title": "MacBook Pro 2020",
        "description": "...",
        "price": 899.00,
        ...
      }
    ],
    "query": "laptop",
    "pagination": {
      "total": 15,
      "page": 1,
      "pages": 2,
      "limit": 12
    }
  }
}
```

**Note:** Uses MongoDB full-text search across title, description, and tags fields. Results sorted by relevance score and then by creation date.

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Search query is required"
}
```

---

### 7. Get My Listings
**GET** `/api/products/user/my-listings`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 12) - Items per page
- `status` (optional) - Filter by status

**Example Request:**
```
GET /api/products/user/my-listings?page=1&limit=10&status=available
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "title": "My Product",
        "price": 100.00,
        "status": "available",
        "category": {
          "_id": "507f191e810c19729de860ea",
          "name": "Electronics"
        },
        "views": 25,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "pages": 1,
      "limit": 12
    }
  }
}
```

---

## Testing with cURL

### Create Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Calculus Textbook",
    "description": "Barely used textbook for Math 101",
    "price": 45.00,
    "category": "507f191e810c19729de860ea",
    "condition": "Like New",
    "images": [
      {
        "url": "https://res.cloudinary.com/demo/image1.webp",
        "publicId": "ecampus/products/user_123_0"
      }
    ],
    "tags": ["textbook", "math", "calculus"]
  }'
```

### Get All Products
```bash
curl -X GET "http://localhost:5000/api/products?page=1&limit=12&category=507f191e810c19729de860ea"
```

### Search Products
```bash
curl -X GET "http://localhost:5000/api/products/search?q=laptop&page=1"
```

### Update Product
```bash
curl -X PUT http://localhost:5000/api/products/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 799.00,
    "status": "sold"
  }'
```

### Delete Product
```bash
curl -X DELETE http://localhost:5000/api/products/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes

- All products are filtered to show only active products (`isActive: true`) by default
- View count is automatically incremented when a product is viewed
- Seller information is automatically populated from authenticated user
- MongoDB text index is required for search functionality
- Products are sorted by creation date (newest first) by default
- Search results are sorted by relevance score
