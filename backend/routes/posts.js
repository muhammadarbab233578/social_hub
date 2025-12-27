const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// @route   POST /api/posts
// @desc    Create a new post with media (images/videos)
// @access  Private
router.post('/', verifyToken, async (req, res) => {
  try {
    const { content, image, media } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const post = new Post({
      author: req.userId,
      content,
      image: image || null,
      media: media || [] // Array of {type: String, mediaType: 'image'|'video'}
    });

    await post.save();
    await post.populate('author', 'username profilePicture');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/posts/feed/:userId
// @desc    Get feed for user (posts from following)
// @access  Private
router.get('/feed/:userId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('following');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const followingIds = user.following.map(u => u._id);
    
    const posts = await Post.find({ author: { $in: followingIds } })
      .populate('author', 'username profilePicture')
      .populate('likes', 'username')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      posts,
      hasFollowing: followingIds.length > 0
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/posts/:postId
// @desc    Get single post
// @access  Public
router.get('/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'username profilePicture')
      .populate('likes', 'username')
      .populate('replies');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.status(200).json({ success: true, post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/posts/:postId/like
// @desc    Like a post
// @access  Private
router.post('/:postId/like', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.userId);
    
    if (likeIndex === -1) {
      post.likes.push(req.userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    await post.populate('author', 'username profilePicture');

    res.status(200).json({
      success: true,
      message: likeIndex === -1 ? 'Post liked' : 'Post unliked',
      post
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/posts/:postId/reply
// @desc    Reply to a post
// @access  Private
router.post('/:postId/reply', verifyToken, async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const parentPost = await Post.findById(req.params.postId);
    if (!parentPost) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const reply = new Post({
      author: req.userId,
      content,
      image: image || null,
      parentPost: req.params.postId
    });

    await reply.save();
    parentPost.replies.push(reply._id);
    await parentPost.save();

    await reply.populate('author', 'username profilePicture');

    res.status(201).json({
      success: true,
      message: 'Reply posted successfully',
      reply
    });
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/posts/:postId/comment
// @desc    Add a comment to a post
// @access  Private
router.post('/:postId/comment', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = {
      author: req.userId,
      content,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();
    await post.populate('comments.author', 'username profilePicture');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: post.comments[post.comments.length - 1]
    });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/posts/:postId/comment/:commentId
// @desc    Delete a comment from a post
// @access  Private
router.delete('/:postId/comment/:commentId', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    post.comments.id(req.params.commentId).deleteOne();
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/posts/:postId
// @desc    Delete a post
// @access  Private
router.delete('/:postId', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await Post.deleteOne({ _id: req.params.postId });

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
