const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a product title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category']
  },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Excellent', 'Good', 'Fair'],
    required: [true, 'Please specify the condition']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String
    }
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved', 'inactive'],
    default: 'available'
  },
  location: {
    campus: {
      type: String,
      trim: true
    },
    building: {
      type: String,
      trim: true
    }
  },
  contact: {
    phone: {
      type: String,
      trim: true,
      required: [true, 'Please provide contact phone number']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    }
  },
  views: {
    type: Number,
    default: 0
  },
  contactReveals: {
    type: Number,
    default: 0
  },
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isOfficialStore: {
    type: Boolean,
    default: false,
    index: true
  },
  sponsored: {
    isSponsored: {
      type: Boolean,
      default: false,
      index: true
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    pricing: {
      amount: {
        type: Number,
        min: 0
      },
      currency: {
        type: String,
        default: 'KSH'
      },
      period: {
        type: String,
        enum: ['day', 'week', 'month'],
        default: 'week'
      }
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'expired'],
      default: 'pending'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance optimization
productSchema.index({ title: 'text', description: 'text', tags: 'text' }); // Full-text search
productSchema.index({ category: 1, status: 1 }); // Category filtering
productSchema.index({ seller: 1 }); // User's listings
productSchema.index({ status: 1, createdAt: -1 }); // Recent available products
productSchema.index({ 'sponsored.isSponsored': 1, createdAt: -1 }); // Sponsored products
productSchema.index({ price: 1, status: 1 }); // Price-based queries
productSchema.index({ createdAt: -1 }); // Sorting by date
productSchema.index({ isOfficialStore: 1, status: 1, createdAt: -1 }); // Official store products
productSchema.index({ isActive: 1, status: 1, 'sponsored.isSponsored': -1, createdAt: -1 }); // Main listing query optimization

module.exports = mongoose.model('Product', productSchema);
