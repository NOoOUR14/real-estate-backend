const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true }
}, { timestamps: true });

const propertySchema = new mongoose.Schema({
    title: {
        type: String,   
        required: true
    },
    description: {
        type: String,
        required: true
    },  
    price: {
        type: Number,
        required: true
    },
    location: { 
        type: String,
        required: true
    },  
    type: { 
        type: String,
        enum: ['Apartment', 'House', 'sale', 'rent'],
        default: 'sale'
    },
    image: {
        type: String,
        default: 'no-image.jpg'
    },
    reviews: [reviewSchema],
    rating: { 
        type: Number, 
        required: true, 
        default: 0 
    },
    numReviews: { 
        type: Number, 
        required: true, 
        default: 0 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

propertySchema.virtual('fullImageUrl').get(function() {
    if (this.image && !this.image.startsWith('http')) {
        return `http://localhost:5000${this.image}`;
    }
    return this.image;
});

module.exports = mongoose.model('Property', propertySchema);