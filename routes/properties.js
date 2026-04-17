const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
    try {
        const reqQuery = { ...req.query };
        const removeFields = ['select', 'sort', 'page', 'limit'];
        removeFields.forEach(param => delete reqQuery[param]);

        if (reqQuery.keyword) {
            reqQuery.$or = [
                { title: { $regex: reqQuery.keyword, $options: 'i' } },
                { description: { $regex: reqQuery.keyword, $options: 'i' } },
                { location: { $regex: reqQuery.keyword, $options: 'i' } }
            ];
            delete reqQuery.keyword;
        }

        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        let query = Property.find(JSON.parse(queryStr));

        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const total = await Property.countDocuments(JSON.parse(queryStr));

        query = query.skip(startIndex).limit(limit);

        const properties = await query;

        res.status(200).json({
            success: true,
            count: properties.length,
            pagination: {
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit)
            },
            data: properties
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/', protect, admin, (req, res) => {
    upload.single('image')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        try {
            const property = await Property.create({
                ...req.body,
                image: req.file ? `/uploads/${req.file.filename}` : 'no-image.jpg'
            });

            res.status(201).json({ success: true, data: property });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
});


router.put('/:id', protect, admin, async (req, res) => {
    try {
        let property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        property = await Property.findByIdAndUpdate(req.params.id, req.body, {
            new: true, 
            runValidators: true 
        });

        res.status(200).json({ success: true, data: property });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        await property.deleteOne();

        res.status(200).json({ success: true, message: 'Property removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


router.post('/:id/reviews', protect, async (req, res) => {
    const { rating, comment } = req.body;

    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const alreadyReviewed = property.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'Property already reviewed' });
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };

        property.reviews.push(review);
        property.numReviews = property.reviews.length;

        property.rating = property.reviews.reduce((acc, item) => item.rating + acc, 0) / property.reviews.length;

        await property.save();
        res.status(201).json({ message: 'Review added' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;