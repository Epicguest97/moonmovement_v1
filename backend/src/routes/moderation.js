
const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authenticateToken } = require('../middleware/auth');

// Check if user is moderator of subreddit
const checkModerator = async (req, res, next) => {
  try {
    const { subreddit } = req.params;
    const userId = req.user.userId;
    
    const moderator = await prisma.subredditModerator.findFirst({
      where: {
        subreddit,
        userId,
        isActive: true
      }
    });
    
    if (!moderator) {
      return res.status(403).json({ error: 'You are not a moderator of this subreddit' });
    }
    
    req.moderator = moderator;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Failed to check moderator status' });
  }
};

// Get moderators for a subreddit
router.get('/:subreddit/moderators', async (req, res) => {
  try {
    const { subreddit } = req.params;
    
    const moderators = await prisma.subredditModerator.findMany({
      where: {
        subreddit,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        assignedAt: 'asc'
      }
    });
    
    res.json(moderators);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch moderators' });
  }
});

// Add moderator (requires authentication and existing mod status)
router.post('/:subreddit/moderators', authenticateToken, checkModerator, async (req, res) => {
  try {
    const { subreddit } = req.params;
    const { username, permissions } = req.body;
    
    // Check if user has permission to add mods
    const modPermissions = JSON.parse(req.moderator.permissions);
    if (!modPermissions.manageUsers) {
      return res.status(403).json({ error: 'You do not have permission to add moderators' });
    }
    
    // Find user to add as mod
    const userToAdd = await prisma.user.findUnique({
      where: { username }
    });
    
    if (!userToAdd) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if already a moderator
    const existingMod = await prisma.subredditModerator.findFirst({
      where: {
        subreddit,
        userId: userToAdd.id,
        isActive: true
      }
    });
    
    if (existingMod) {
      return res.status(400).json({ error: 'User is already a moderator' });
    }
    
    // Add moderator
    const newMod = await prisma.subredditModerator.create({
      data: {
        subreddit,
        userId: userToAdd.id,
        permissions: JSON.stringify(permissions),
        assignedBy: req.user.userId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            createdAt: true
          }
        }
      }
    });
    
    // Log moderation action
    await prisma.moderationAction.create({
      data: {
        moderatorId: req.user.userId,
        subreddit,
        action: 'add_moderator',
        details: JSON.stringify({ addedUser: username, permissions })
      }
    });
    
    res.json(newMod);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add moderator' });
  }
});

// Remove moderator
router.delete('/:subreddit/moderators/:userId', authenticateToken, checkModerator, async (req, res) => {
  try {
    const { subreddit, userId } = req.params;
    
    // Check permissions
    const modPermissions = JSON.parse(req.moderator.permissions);
    if (!modPermissions.manageUsers) {
      return res.status(403).json({ error: 'You do not have permission to remove moderators' });
    }
    
    // Remove moderator
    await prisma.subredditModerator.updateMany({
      where: {
        subreddit,
        userId: parseInt(userId),
        isActive: true
      },
      data: {
        isActive: false
      }
    });
    
    // Log action
    await prisma.moderationAction.create({
      data: {
        moderatorId: req.user.userId,
        subreddit,
        action: 'remove_moderator',
        details: JSON.stringify({ removedUserId: userId })
      }
    });
    
    res.json({ message: 'Moderator removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove moderator' });
  }
});

// Remove post
router.delete('/:subreddit/posts/:postId', authenticateToken, checkModerator, async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason } = req.body;
    
    // Check permissions
    const modPermissions = JSON.parse(req.moderator.permissions);
    if (!modPermissions.managePosts) {
      return res.status(403).json({ error: 'You do not have permission to remove posts' });
    }
    
    // Remove post
    const updatedPost = await prisma.post.update({
      where: { id: parseInt(postId) },
      data: {
        isRemoved: true,
        removalReason: reason,
        removedBy: req.user.userId,
        removedAt: new Date()
      }
    });
    
    // Log action
    await prisma.moderationAction.create({
      data: {
        moderatorId: req.user.userId,
        postId: parseInt(postId),
        subreddit: req.params.subreddit,
        action: 'remove_post',
        reason
      }
    });
    
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove post' });
  }
});

// Approve post
router.post('/:subreddit/posts/:postId/approve', authenticateToken, checkModerator, async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Check permissions
    const modPermissions = JSON.parse(req.moderator.permissions);
    if (!modPermissions.managePosts) {
      return res.status(403).json({ error: 'You do not have permission to approve posts' });
    }
    
    // Approve post
    const updatedPost = await prisma.post.update({
      where: { id: parseInt(postId) },
      data: {
        isRemoved: false,
        removalReason: null,
        removedBy: null,
        removedAt: null
      }
    });
    
    // Log action
    await prisma.moderationAction.create({
      data: {
        moderatorId: req.user.userId,
        postId: parseInt(postId),
        subreddit: req.params.subreddit,
        action: 'approve_post'
      }
    });
    
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve post' });
  }
});

// Get moderation log
router.get('/:subreddit/log', authenticateToken, checkModerator, async (req, res) => {
  try {
    const { subreddit } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const actions = await prisma.moderationAction.findMany({
      where: { subreddit },
      include: {
        moderator: {
          select: {
            username: true
          }
        },
        post: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });
    
    res.json(actions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch moderation log' });
  }
});

// Check if user is moderator (for frontend)
router.get('/:subreddit/check', authenticateToken, async (req, res) => {
  try {
    const { subreddit } = req.params;
    const userId = req.user.userId;
    
    const moderator = await prisma.subredditModerator.findFirst({
      where: {
        subreddit,
        userId,
        isActive: true
      }
    });
    
    res.json({ 
      isModerator: !!moderator,
      permissions: moderator ? JSON.parse(moderator.permissions) : null
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check moderator status' });
  }
});

module.exports = router;
