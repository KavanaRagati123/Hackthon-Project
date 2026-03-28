const express = require('express');
const xss = require('xss');
const { auth } = require('../middleware/auth');
const { postValidation } = require('../middleware/validation');
const Post = require('../models/Post');

const router = express.Router();

// Get posts (paginated, filtered by category)
router.get('/', auth, async (req, res, next) => {
  try {
    const { category, page = 1, limit = 15 } = req.query;
    let filter = {};
    if (category) filter.category = category;

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name avatar anonymousId')
      .populate('comments.userId', 'name avatar anonymousId');

    const total = await Post.countDocuments(filter);

    // Mask anonymous identities
    const masked = posts.map(post => {
      const obj = post.toObject();
      if (obj.isAnonymous) {
        obj.userId = { name: obj.userId?.anonymousId || 'Anonymous User', avatar: null };
      }
      obj.comments = obj.comments.map(c => {
        if (c.isAnonymous) {
          c.userId = { name: c.userId?.anonymousId || 'Anonymous User', avatar: null };
        }
        return c;
      });
      return obj;
    });

    res.json({ posts: masked, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

// Create post
router.post('/', auth, postValidation, async (req, res, next) => {
  try {
    const { content, category, isAnonymous } = req.body;
    const post = new Post({
      userId: req.userId,
      content: xss(content),
      category: category || 'General',
      isAnonymous: isAnonymous || false
    });
    await post.save();

    const populated = await Post.findById(post._id)
      .populate('userId', 'name avatar anonymousId');

    const obj = populated.toObject();
    if (obj.isAnonymous) {
      obj.userId = { name: obj.userId?.anonymousId || 'Anonymous User' };
    }

    res.status(201).json({ post: obj });
  } catch (error) {
    next(error);
  }
});

// Add comment
router.post('/:id/comments', auth, async (req, res, next) => {
  try {
    const { content, isAnonymous } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({
      userId: req.userId,
      content: xss(content),
      isAnonymous: isAnonymous || false
    });
    post.commentCount = post.comments.length;
    await post.save();

    const populated = await Post.findById(post._id)
      .populate('userId', 'name avatar anonymousId')
      .populate('comments.userId', 'name avatar anonymousId');

    res.json({ post: populated });
  } catch (error) {
    next(error);
  }
});

// Like post
router.post('/:id/like', auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const likeIndex = post.likes.indexOf(req.userId);
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(req.userId);
    }
    post.likeCount = post.likes.length;
    await post.save();

    res.json({ liked: likeIndex === -1, likeCount: post.likeCount });
  } catch (error) {
    next(error);
  }
});

// Report post
router.post('/:id/report', auth, async (req, res, next) => {
  try {
    const { reason } = req.body;
    await Post.findByIdAndUpdate(req.params.id, {
      reported: true,
      $push: { reportReasons: reason || 'Inappropriate content' }
    });
    res.json({ message: 'Post reported' });
  } catch (error) {
    next(error);
  }
});

// Delete post (admin)
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (req.user.role !== 'admin' && post.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
