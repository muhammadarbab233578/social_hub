const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');

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

// @route   GET /api/users/suggestions/:userId
// @desc    Get user suggestions (users the current user is not following)
// @access  Private
router.get('/suggestions/:userId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const suggestedUsers = await User.find({
      _id: { 
        $nin: [...user.following, user._id] 
      }
    })
    .select('username profilePicture bio followers')
    .limit(10);

    res.status(200).json({
      success: true,
      users: suggestedUsers
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/search
// @desc    Search users by username
// @access  Public
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;

    const users = await User.find({
      username: { $regex: query, $options: 'i' }
    })
    .select('username profilePicture bio followers')
    .limit(10);

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/:userId/profile
// @desc    Get user profile with posts
// @access  Public
router.get('/:userId/profile', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'username profilePicture')
      .populate('likes', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      user,
      posts
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/users/:userId/follow/:targetId
// @desc    Follow/Unfollow a user
// @access  Private
router.post('/:userId/follow/:targetId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const targetUser = await User.findById(req.params.targetId);

    if (!user || !targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isFollowing = user.following.includes(req.params.targetId);

    if (isFollowing) {
      // Unfollow
      user.following = user.following.filter(id => id.toString() !== req.params.targetId);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.params.userId);
    } else {
      // Follow
      user.following.push(req.params.targetId);
      targetUser.followers.push(req.params.userId);
    }

    await user.save();
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      isFollowing: !isFollowing
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/:userId/activity
// @desc    Get user activity (likes, comments on user's posts, followers)
// @access  Private
router.get('/:userId/activity', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate('followers', 'username profilePicture');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Posts authored by the user
    const posts = await Post.find({ author: userId })
      .populate('author', 'username profilePicture')
      .populate('likes', 'username profilePicture')
      .populate('comments.author', 'username profilePicture')
      .sort({ updatedAt: -1 })
      .limit(40);

    const likeEvents = [];
    const commentEvents = [];

    posts.forEach((post) => {
      const postContent = post.content?.slice(0, 140) || '';

      // Likes on user's post
      post.likes.forEach((liker) => {
        if (liker._id.toString() === userId) return;
        likeEvents.push({
          type: 'like',
          actor: liker,
          postId: post._id,
          postContent,
          createdAt: post.updatedAt,
        });
      });

      // Comments on user's post
      (post.comments || []).forEach((comment) => {
        const author = comment.author;
        if (!author || author._id?.toString() === userId || author.toString?.() === userId) return;
        commentEvents.push({
          type: 'comment',
          actor: author,
          postId: post._id,
          postContent,
          commentText: comment.content,
          createdAt: comment.createdAt,
        });
      });
    });

    // Followers as events (note: no timestamp stored; use user.updatedAt as best-effort ordering)
    const followerEvents = (user.followers || []).map((follower) => ({
      type: 'follow',
      actor: follower,
      postId: null,
      postContent: 'Started following you',
      createdAt: user.updatedAt,
    }));

    const notifications = [...likeEvents, ...commentEvents, ...followerEvents]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 60);

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/:userId/profile
// @desc    Update user profile (bio, profile picture)
// @access  Private
router.put('/:userId/profile', verifyToken, async (req, res) => {
  try {
    if (req.params.userId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    const { bio, profilePicture } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (bio !== undefined) {
      user.bio = bio;
    }
    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/:userId/followers
// @desc    Get user followers list
// @access  Public
router.get('/:userId/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('followers', 'username profilePicture bio');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      followers: user.followers
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/:userId/following
// @desc    Get user following list
// @access  Public
router.get('/:userId/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('following', 'username profilePicture bio');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      following: user.following
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
