// ============================================================
// Category Model - Event categories
// ============================================================
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: String,
  icon: String,        // Emoji or icon name
  color: String,       // Hex color for UI
  image: String,       // Category banner image
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Auto-generate slug
CategorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

// Virtual: Event count
CategorySchema.virtual('eventCount', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'category',
  count: true
});

module.exports = mongoose.model('Category', CategorySchema);
