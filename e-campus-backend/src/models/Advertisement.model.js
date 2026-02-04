const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    message: {
      type: String,
      required: [true, 'Advertisement message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    link: {
      type: String,
      required: [true, 'Advertisement link is required'],
      trim: true,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Please provide a valid URL starting with http:// or https://'
      }
    },
    type: {
      type: String,
      enum: ['banner', 'sidebar', 'inline'],
      required: [true, 'Advertisement type is required'],
      default: 'banner'
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function(v) {
          return v > this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    impressions: {
      type: Number,
      default: 0,
      min: 0
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0
    },
    imageUrl: {
      type: String,
      trim: true
    },
    priority: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    pricing: {
      amount: {
        type: Number,
        required: [true, 'Pricing amount is required'],
        min: 0
      },
      currency: {
        type: String,
        default: 'KSH',
        enum: ['KSH', 'USD', 'EUR']
      },
      period: {
        type: String,
        enum: ['day', 'week', 'month', 'year'],
        default: 'month'
      }
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'expired', 'refunded'],
      default: 'pending'
    },
    paymentDate: {
      type: Date
    },
    paymentMethod: {
      type: String,
      enum: ['mpesa', 'bank', 'cash', 'other'],
      trim: true
    },
    paymentReference: {
      type: String,
      trim: true
    },
    advertiser: {
      name: {
        type: String,
        trim: true
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      },
      phone: {
        type: String,
        trim: true
      }
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
  },
  {
    timestamps: true
  }
);

// Index for querying active ads within date range
advertisementSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
advertisementSchema.index({ type: 1 });

// Virtual for click-through rate (CTR)
advertisementSchema.virtual('ctr').get(function() {
  if (this.impressions === 0) return 0;
  return ((this.clicks / this.impressions) * 100).toFixed(2);
});

// Method to increment impressions
advertisementSchema.methods.incrementImpressions = async function() {
  this.impressions += 1;
  return await this.save();
};

// Method to increment clicks
advertisementSchema.methods.incrementClicks = async function() {
  this.clicks += 1;
  return await this.save();
};

// Static method to get active ads
advertisementSchema.statics.getActiveAds = async function(type = null) {
  const now = new Date();
  const query = {
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  };

  if (type) query.type = type;

  return await this.find(query)
    .sort({ priority: -1, createdAt: -1 })
    .select('-__v');
};

// Static method to calculate total revenue
advertisementSchema.statics.getTotalRevenue = async function(startDate = null, endDate = null) {
  const query = { paymentStatus: 'paid' };

  if (startDate || endDate) {
    query.paymentDate = {};
    if (startDate) query.paymentDate.$gte = new Date(startDate);
    if (endDate) query.paymentDate.$lte = new Date(endDate);
  }

  const result = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$pricing.currency',
        total: { $sum: '$pricing.amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  return result;
};

// Method to check if ad is expired
advertisementSchema.methods.isExpired = function() {
  return new Date() > this.endDate;
};

// Method to mark as paid
advertisementSchema.methods.markAsPaid = async function(paymentMethod, paymentReference) {
  this.paymentStatus = 'paid';
  this.paymentDate = new Date();
  this.paymentMethod = paymentMethod;
  this.paymentReference = paymentReference;
  return await this.save();
};

// Ensure virtuals are included in JSON
advertisementSchema.set('toJSON', { virtuals: true });
advertisementSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Advertisement', advertisementSchema);
