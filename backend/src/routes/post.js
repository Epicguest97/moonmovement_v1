const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authenticateToken } = require('../middleware/auth');

// GET all posts (excluding removed posts for non-mods)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching posts...');
    const posts = await prisma.post.findMany({
      where: {
        isRemoved: false // Only show non-removed posts
      },
      include: { 
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true
          }
        }, 
        comments: {
          where: {
            isRemoved: false // Only count non-removed comments
          }
        }, 
        votes: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log('Posts fetched successfully:', posts.length);
    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Failed to fetch posts', details: err.message });
  }
});

// GET a single post by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      include: { 
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true
          }
        }, 
        comments: {
          where: {
            isRemoved: false // Only show non-removed comments
          }
        }, 
        votes: true 
      }
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    // If post is removed, only show to mods or author
    if (post.isRemoved) {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        try {
          const jwt = require('jsonwebtoken');
          const { JWT_SECRET } = require('../config');
          const decoded = jwt.verify(token, JWT_SECRET);
          
          // Check if user is author or moderator
          const isModerator = await prisma.subredditModerator.findFirst({
            where: {
              subreddit: post.subreddit,
              userId: decoded.userId,
              isActive: true
            }
          });
          
          if (decoded.userId !== post.authorId && !isModerator) {
            return res.status(404).json({ error: 'Post not found' });
          }
        } catch {
          return res.status(404).json({ error: 'Post not found' });
        }
      } else {
        return res.status(404).json({ error: 'Post not found' });
      }
    }
    
    res.json(post);
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ error: 'Failed to fetch post', details: err.message });
  }
});

// Create a new post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, subreddit, imageUrl, linkUrl, tags } = req.body;
    
    // IMPORTANT: Use the authenticated user's ID from the JWT token
    // instead of trusting any user ID sent in the request body
    const userId = req.user.userId;
    
    const post = await prisma.post.create({
      data: {
        title,
        content,
        subreddit: subreddit || 'general',
        imageUrl,
        linkUrl,
        tags,
        authorId: userId  // Use the authenticated user's ID
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
    
    // If this is the first post in the subreddit, make the author a moderator
    const existingMods = await prisma.subredditModerator.findFirst({
      where: {
        subreddit: post.subreddit,
        isActive: true
      }
    });
    
    if (!existingMods) {
      await prisma.subredditModerator.create({
        data: {
          subreddit: post.subreddit,
          userId: userId,
          permissions: JSON.stringify({
            managePosts: true,
            manageUsers: true,
            manageSettings: true
          }),
          assignedBy: userId
        }
      });
    }
    
    res.status(201).json(post);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Failed to create post', details: err.message });
  }
});

// PUT (update) a post by id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, tags } = req.body;
  try {
    const updated = await prisma.post.update({
      where: { id: Number(id) },
      data: { 
        title, 
        content,
        tags: tags ? tags.join(',') : null
      },
      include: { 
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true
          }
        }, 
        comments: true, 
        votes: true 
      }
    });
    res.json(updated);
  } catch (err) {
    console.error('PUT /:id Error:', err);
    res.status(404).json({ error: 'Post not found', details: err.message });
  }
});

// Vote (upvote or downvote) a post
router.post('/:id/vote', async (req, res) => {
  const { id } = req.params;
  const { username, type } = req.body; // type: 1 for upvote, -1 for downvote
  if (!username || ![1, -1].includes(type)) {
    return res.status(400).json({ error: 'Invalid vote data' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(400).json({ error: 'User not found' });
    const postId = Number(id);
    // Check if vote exists
    const existingVote = await prisma.vote.findFirst({
      where: { userId: user.id, postId }
    });
    let vote;
    if (existingVote) {
      // Update vote
      vote = await prisma.vote.update({
        where: { id: existingVote.id },
        data: { type }
      });
    } else {
      // Create vote
      vote = await prisma.vote.create({
        data: { type, userId: user.id, postId }
      });
    }
    // Return updated post with votes
    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      include: { 
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true
          }
        }, 
        comments: true, 
        votes: true 
      }
    });
    res.json(updatedPost);
  } catch (err) {
    console.error('Vote Error:', err);
    res.status(500).json({ error: 'Failed to vote on post', details: err.message });
  }
});

module.exports = router;
