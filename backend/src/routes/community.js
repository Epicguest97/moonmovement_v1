
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

// Middleware to verify authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// GET all communities
router.get('/', async (req, res) => {
  try {
    const communities = await prisma.community.findMany({
      orderBy: {
        memberCount: 'desc'
      }
    });
    res.json(communities);
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
});

// GET community by name
router.get('/name/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const community = await prisma.community.findUnique({
      where: { name },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          }
        }
      }
    });
    
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }
    
    res.json(community);
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({ error: 'Failed to fetch community' });
  }
});

// GET single community by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const community = await prisma.community.findUnique({
      where: { id: parseInt(id) },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          }
        }
      }
    });
    
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }
    
    res.json(community);
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({ error: 'Failed to fetch community' });
  }
});

// POST create new community (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, bannerImage, icon } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }
    
    const community = await prisma.community.create({
      data: {
        name,
        description,
        bannerImage,
        icon,
        memberCount: 1,
        onlineCount: 1,
        members: {
          create: {
            userId: req.user.userId
          }
        }
      }
    });
    
    res.status(201).json(community);
  } catch (error) {
    console.error('Error creating community:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Community name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create community' });
    }
  }
});

// PUT update community (requires moderator permissions)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, bannerImage, icon } = req.body;
    const userId = req.user.userId;
    
    // Check if user is moderator
    const moderator = await prisma.subredditModerator.findFirst({
      where: {
        subreddit: name || (await prisma.community.findUnique({ where: { id: parseInt(id) } }))?.name,
        userId,
        isActive: true
      }
    });
    
    if (!moderator) {
      return res.status(403).json({ error: 'You are not a moderator of this community' });
    }
    
    const permissions = JSON.parse(moderator.permissions);
    if (!permissions.manageSettings) {
      return res.status(403).json({ error: 'You do not have permission to update community settings' });
    }
    
    const community = await prisma.community.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(bannerImage !== undefined && { bannerImage }),
        ...(icon !== undefined && { icon })
      }
    });
    
    res.json(community);
  } catch (error) {
    console.error('Error updating community:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Community not found' });
    } else if (error.code === 'P2002') {
      res.status(400).json({ error: 'Community name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update community' });
    }
  }
});

// POST join community (requires authentication)
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Check if user is already a member
    const existingMember = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: userId,
          communityId: parseInt(id)
        }
      }
    });
    
    if (existingMember) {
      return res.status(400).json({ error: 'Already a member of this community' });
    }
    
    // Add user to community and increment member count
    await prisma.$transaction([
      prisma.communityMember.create({
        data: {
          userId: userId,
          communityId: parseInt(id)
        }
      }),
      prisma.community.update({
        where: { id: parseInt(id) },
        data: {
          memberCount: {
            increment: 1
          }
        }
      })
    ]);
    
    res.json({ message: 'Successfully joined community' });
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ error: 'Failed to join community' });
  }
});

// DELETE leave community (requires authentication)
router.delete('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Check if user is a member
    const member = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: userId,
          communityId: parseInt(id)
        }
      }
    });
    
    if (!member) {
      return res.status(400).json({ error: 'Not a member of this community' });
    }
    
    // Remove user from community and decrement member count
    await prisma.$transaction([
      prisma.communityMember.delete({
        where: {
          userId_communityId: {
            userId: userId,
            communityId: parseInt(id)
          }
        }
      }),
      prisma.community.update({
        where: { id: parseInt(id) },
        data: {
          memberCount: {
            decrement: 1
          }
        }
      })
    ]);
    
    res.json({ message: 'Successfully left community' });
  } catch (error) {
    console.error('Error leaving community:', error);
    res.status(500).json({ error: 'Failed to leave community' });
  }
});

// GET check if user is member of community
router.get('/:id/membership', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const member = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: userId,
          communityId: parseInt(id)
        }
      }
    });
    
    res.json({ isMember: !!member });
  } catch (error) {
    console.error('Error checking membership:', error);
    res.status(500).json({ error: 'Failed to check membership' });
  }
});

// DELETE community by id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.community.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Community deleted successfully' });
  } catch (error) {
    console.error('Error deleting community:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Community not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete community' });
    }
  }
});

module.exports = router;
