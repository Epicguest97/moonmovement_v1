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
        isRemoved: false
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
            isRemoved: false
          }
        }, 
        likes: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const postsWithLikeCount = posts.map(post => ({
      ...post,
      likeCount: post.likes.length,
      voteScore: post.likes.length // For backward compatibility
    }));
    
    console.log('Posts fetched successfully:', posts.length);
    res.json(postsWithLikeCount);
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
            isRemoved: false
          }
        }, 
        likes: true 
      }
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    if (post.isRemoved) {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        try {
          const jwt = require('jsonwebtoken');
          const { JWT_SECRET } = require('../config');
          const decoded = jwt.verify(token, JWT_SECRET);
          
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
    
    const postWithLikeCount = {
      ...post,
      likeCount: post.likes.length,
      voteScore: post.likes.length // For backward compatibility
    };
    
    res.json(postWithLikeCount);
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ error: 'Failed to fetch post', details: err.message });
  }
});

// Create a new post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, subreddit, imageUrl, linkUrl, tags } = req.body;
    
    const userId = req.user.userId;
    
    const post = await prisma.post.create({
      data: {
        title,
        content,
        subreddit: subreddit || 'general',
        imageUrl,
        linkUrl,
        tags,
        authorId: userId
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        likes: true
      }
    });
    
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
    
    res.status(201).json({
      ...post,
      likeCount: 0,
      voteScore: 0
    });
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
        likes: true 
      }
    });
    
    res.json({
      ...updated,
      likeCount: updated.likes.length,
      voteScore: updated.likes.length
    });
  } catch (err) {
    console.error('PUT /:id Error:', err);
    res.status(404).json({ error: 'Post not found', details: err.message });
  }
});

// Like/Unlike a post
router.post('/:id/like', async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }
  
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(400).json({ error: 'User not found' });
    
    const postId = Number(id);
    
    // Check if like exists
    const existingLike = await prisma.like.findFirst({
      where: { userId: user.id, postId }
    });
    
    if (existingLike) {
      // Unlike - remove the like
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
    } else {
      // Like - create a new like
      await prisma.like.create({
        data: { userId: user.id, postId }
      });
    }
    
    // Return updated post with likes
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
        likes: true 
      }
    });
    
    res.json({
      ...updatedPost,
      likeCount: updatedPost.likes.length,
      voteScore: updatedPost.likes.length
    });
  } catch (err) {
    console.error('Like Error:', err);
    res.status(500).json({ error: 'Failed to like post', details: err.message });
  }
});

// Keep the old vote endpoint for backward compatibility but map to likes
router.post('/:id/vote', async (req, res) => {
  const { id } = req.params;
  const { username, type } = req.body;
  
  if (!username || ![1, -1].includes(type)) {
    return res.status(400).json({ error: 'Invalid vote data' });
  }
  
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(400).json({ error: 'User not found' });
    
    const postId = Number(id);
    
    // For upvotes, treat as likes. For downvotes, remove likes if they exist
    if (type === 1) {
      const existingLike = await prisma.like.findFirst({
        where: { userId: user.id, postId }
      });
      
      if (!existingLike) {
        await prisma.like.create({
          data: { userId: user.id, postId }
        });
      }
    } else if (type === -1) {
      await prisma.like.deleteMany({
        where: { userId: user.id, postId }
      });
    }
    
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
        likes: true 
      }
    });
    
    res.json({
      ...updatedPost,
      votes: updatedPost.likes.map(like => ({ type: 1, userId: like.userId })), // For backward compatibility
      likeCount: updatedPost.likes.length
    });
  } catch (err) {
    console.error('Vote Error:', err);
    res.status(500).json({ error: 'Failed to vote on post', details: err.message });
  }
});

module.exports = router;
