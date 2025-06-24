const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { profileUpload } = require('../utils/fileUpload');

const prisma = new PrismaClient();
const router = express.Router();

// Update user profile with file upload support
router.put('/profile', authenticateToken, profileUpload.single('profileImage'), async (req, res) => {
  try {
    const { displayName, bio, location } = req.body;
    const userId = req.user.userId;

    // Check if we have a file upload
    let profileImagePath = undefined;
    if (req.file) {
      // Create a URL path to access the image
      profileImagePath = `/uploads/profiles/${req.file.filename}`;
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(displayName && { displayName }),
        ...(bio && { bio }),
        ...(location && { location }),
        ...(profileImagePath && { profileImage: profileImagePath }),
      },
      select: {
        id: true,
        username: true,
        bio: true,
        location: true,
        profileImage: true,
        backgroundImage: true
      }
    });

    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update account details (username, email)
router.put('/account', authenticateToken, async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user.userId;

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });
      
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
    }

    // Check if email is already taken by another user
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingEmail && existingEmail.id !== userId) {
        return res.status(400).json({ error: 'Email is already in use' });
      }
    }

    // Update user account
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        ...(email && { email })
      },
      select: {
        id: true,
        username: true,
        email: true
      }
    });

    res.json({ 
      message: 'Account updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Account update error:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

// Change password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get user profile by username (for viewing other profiles)
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: false, // Don't expose email to others
        createdAt: true,
        profileImage: true, // Add this
        backgroundImage: true, // Add this
        bio: true, // Change from mock data to actual field
        location: true, // Change from mock data to actual field
        posts: {
          select: {
            id: true,
            title: true,
            content: true,
            subreddit: true,
            createdAt: true,
            votes: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            post: {
              select: {
                title: true,
                subreddit: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        communityMemberships: {
          select: {
            community: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        },
        _count: {
          select: {
            posts: true,
            comments: true,
            votes: true,
            communityMemberships: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate karma from posts
    const karma = user.posts.reduce((total, post) => {
      const postKarma = post.votes.reduce((sum, vote) => sum + vote.type, 0);
      return total + postKarma;
    }, 0);

    res.json({
      ...user,
      karma
      // No need for the mock bio and location anymore
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

module.exports = router;
