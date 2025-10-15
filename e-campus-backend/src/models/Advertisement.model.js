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
    position: {
      type: String,
      enum: ['top', 'middle', 'bottom', 'right', 'left'],
      required: [true, 'Advertisement position is required'],
      default: 'top'
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
    }
  },
  {
    timestamps: true
  }
);

// Index for querying active ads within date range
advertisementSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
advertisementSchema.index({ type: 1, position: 1 });

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
advertisementSchema.statics.getActiveAds = async function(type = null, position = null) {
  const now = new Date();
  const query = {
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  };

  if (type) query.type = type;
  if (position) query.position = position;

  return await this.find(query)
    .sort({ priority: -1, createdAt: -1 })
    .select('-__v');
};

// Ensure virtuals are included in JSON
advertisementSchema.set('toJSON', { virtuals: true });
advertisementSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Advertisement', advertisementSchema);
