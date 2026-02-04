const mongoose = require('mongoose');

const campusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a campus name'],
    unique: true,
    trim: true,
    maxlength: [100, 'Campus name cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  city: {
    type: String,
    trim: true,
    maxlength: [50, 'City name cannot be more than 50 characters']
  },
  itemCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create slug from name before saving
campusSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

// Indexes for fast lookups
campusSchema.index({ slug: 1 });
campusSchema.index({ isActive: 1, name: 1 });

module.exports = mongoose.model('Campus', campusSchema);
