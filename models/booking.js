const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property ID is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  bookingDate: {
    type: Date,
    required: [true, 'Please specify a date and time for the visit'],
    validate: {
      validator: function (value) {
        return value > Date.now();
      },
      message: 'Booking date must be in the future'
    }
  },
  message: {
    type: String,
    required: [true, 'Please add a message'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Contact phone number is required'],
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      message: '{VALUE} is not a valid status'
    },
    default: 'Pending'
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

bookingSchema.index({ property: 1, user: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);