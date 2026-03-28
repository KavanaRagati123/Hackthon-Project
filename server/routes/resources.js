const express = require('express');
const { auth, authorize, optionalAuth } = require('../middleware/auth');
const { resourceValidation } = require('../middleware/validation');
const Resource = require('../models/Resource');

const router = express.Router();

// Get resources (paginated, filtered) - public
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { category, type, language, search, page = 1, limit = 12 } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (type) filter.type = type;
    if (language) filter.language = language;
    if (search) {
      filter.$text = { $search: search };
    }

    const resources = await Resource.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'name');

    const total = await Resource.countDocuments(filter);

    res.json({
      resources,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total
    });
  } catch (error) {
    next(error);
  }
});

// Get single resource
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('createdBy', 'name');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json({ resource });
  } catch (error) {
    next(error);
  }
});

// Create resource (admin only)
router.post('/', auth, authorize('admin'), resourceValidation, async (req, res, next) => {
  try {
    const resource = new Resource({
      ...req.body,
      createdBy: req.userId
    });
    await resource.save();
    res.status(201).json({ resource });
  } catch (error) {
    next(error);
  }
});

// Update resource (admin)
router.patch('/:id', auth, authorize('admin'), async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json({ resource });
  } catch (error) {
    next(error);
  }
});

// Delete resource (admin)
router.delete('/:id', auth, authorize('admin'), async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
