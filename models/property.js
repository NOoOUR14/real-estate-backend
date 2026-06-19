const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  }
}, { timestamps: true });

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  type: {
    type: String,
    required: [true, 'Property type is required'],
    enum: {
      values: ['Apartment', 'House', 'Villa', 'Condo', 'Land', 'Office', 'Commercial'],
      message: '{VALUE} is not a valid property type'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['available', 'sold', 'rented', 'pending'],
      message: '{VALUE} is not a valid status'
    },
    default: 'available'
  },
  bedrooms: {
    type: Number,
    min: [0, 'Bedrooms cannot be negative'],
    default: 0
  },
  bathrooms: {
    type: Number,
    min: [0, 'Bathrooms cannot be negative'],
    default: 0
  },
  area: {
    type: Number,
    min: [0, 'Area cannot be negative'],
    default: 0
  },
  amenities: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String
  }],
  featuredImage: {
    type: String,
    default: 'no-image.jpg'
  },
  reviews: [reviewSchema],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  listedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

propertySchema.index({ title: 'text', description: 'text', location: 'text' });
propertySchema.index({ price: 1 });
propertySchema.index({ type: 1, status: 1 });
propertySchema.index({ isFeatured: -1, createdAt: -1 });

propertySchema.virtual('featuredImageUrl').get(function () {
  if (this.featuredImage && !this.featuredImage.startsWith('http')) {
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    return `${baseUrl}/uploads/${this.featuredImage}`;
  }
  return this.featuredImage;
});

propertySchema.pre('save', function (next) {
  if (this.reviews.length > 0) {
    this.rating = this.reviews.reduce((acc, item) => item.rating + acc, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
  next();
});

module.exports = mongoose.model('Property', propertySchema);