const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authenticateToken } = require('../middleware/auth');

// Helper function to calculate vote counts
const getVoteCounts = (votes) => {
  const upvotes = votes.filter(vote => vote.type === 1).length;
  const downvotes = votes.filter(vote => vote.type === -1).length;
  return {
    likeCount: upvotes,
    voteScore: upvotes - downvotes,
  };
};

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
        votes: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const postsWithLikeCount = posts.map(post => ({
      ...post,
      ...getVoteCounts(post.votes)
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
        author: true,
        comments: true,
        votes: true,
        poll: {
          include: {
            options: {
              include: {
                votes: true
              }
            }
          }
        }
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
      ...getVoteCounts(post.votes)
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
    const { title, content, subreddit, imageUrl, videoUrl, linkUrl, tags, poll } = req.body;

    const userId = req.user.userId;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        subreddit: subreddit || 'general',
        imageUrl,
        videoUrl,  // Make sure this field is included
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
        votes: true
      }
    });

    // Create poll if provided (this will work after migration)
    if (poll && poll.question && poll.options && poll.options.length > 0) {
      try {
        await prisma.poll.create({
          data: {
            postId: post.id,
            question: poll.question,
            expiresAt: poll.expiresAt ? new Date(poll.expiresAt) : null,
            options: {
              create: poll.options.map(option => ({
                text: option
              }))
            }
          }
        });
      } catch (pollError) {
        console.log('Poll creation failed (migration needed):', pollError.message);
      }
    }

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

// PUT (update) a post by id - requires authentication and ownership
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content, tags } = req.body;
  
  try {
    // Check if the post exists and belongs to the authenticated user
    const existingPost = await prisma.post.findUnique({
      where: { id: Number(id) },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
    
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if the authenticated user is the author of the post
    if (existingPost.authorId !== req.user.userId) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }
    
    // Update the post
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

    res.json({
      ...updated,
      ...getVoteCounts(updated.votes)
    });
  } catch (err) {
    console.error('PUT /:id Error:', err);
    res.status(500).json({ error: 'Failed to update post', details: err.message });
  }
});

// Like/Unlike a post (treats a 'like' as an upvote)
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

    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: user.id,
        postId: postId,
      }
    });

    if (existingVote) {
      if (existingVote.type === 1) {
        await prisma.vote.delete({
          where: { id: existingVote.id }
        });
      } else {
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type: 1 }
        });
      }
    } else {
      await prisma.vote.create({
        data: {
          userId: user.id,
          postId: postId,
          type: 1
        }
      });
    }

    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: { select: { id: true, username: true, email: true, createdAt: true } },
        comments: { where: { isRemoved: false } },
        votes: true
      }
    });

    res.json({
      ...updatedPost,
      ...getVoteCounts(updatedPost.votes)
    });

  } catch (err) {
    console.error('Like Error:', err);
    res.status(500).json({ error: 'Failed to update like status', details: err.message });
  }
});

// Vote on a poll
router.post('/:id/poll/vote', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { optionId } = req.body;
  const userId = req.user.userId;

  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(id) }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Try to find the poll (will work after migration)
    let poll;
    try {
      poll = await prisma.poll.findUnique({
        where: { postId: post.id }
      });
    } catch (pollError) {
      return res.status(404).json({ error: 'Poll functionality not available (migration needed)' });
    }

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Remove existing vote if any
    await prisma.pollVote.deleteMany({
      where: {
        userId: userId,
        pollId: poll.id
      }
    });

    // Add new vote
    await prisma.pollVote.create({
      data: {
        userId: userId,
        pollId: poll.id,
        pollOptionId: optionId
      }
    });

    // Return updated poll with vote counts
    const updatedPoll = await prisma.poll.findUnique({
      where: { id: poll.id },
      include: {
        options: {
          include: {
            votes: true
          }
        }
      }
    });

    res.json(updatedPoll);
  } catch (err) {
    console.error('Error voting on poll:', err);
    res.status(500).json({ error: 'Failed to vote on poll', details: err.message });
  }
});

// Vote on a post (upvote/downvote)
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

        const existingVote = await prisma.vote.findFirst({
            where: { userId: user.id, postId }
        });

        if (existingVote) {
            if (existingVote.type === type) {
                await prisma.vote.delete({ where: { id: existingVote.id } });
            } else {
                await prisma.vote.update({
                    where: { id: existingVote.id },
                    data: { type }
                });
            }
        } else {
            await prisma.vote.create({
                data: { userId: user.id, postId, type }
            });
        }

        const updatedPost = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                author: { select: { id: true, username: true, email: true, createdAt: true } },
                comments: { where: { isRemoved: false } },
                votes: true
            }
        });

        res.json({
            ...updatedPost,
            ...getVoteCounts(updatedPost.votes)
        });

    } catch (err) {
        console.error('Vote Error:', err);
        res.status(500).json({ error: 'Failed to vote on post', details: err.message });
    }
});

// GET posts by subreddit/community
router.get('/community/:subreddit', async (req, res) => {
  try {
    const { subreddit } = req.params;
    console.log('Fetching posts for subreddit:', subreddit);
    
    const posts = await prisma.post.findMany({
      where: {
        subreddit: subreddit,
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
        votes: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const postsWithLikeCount = posts.map(post => ({
      ...post,
      ...getVoteCounts(post.votes),
      commentCount: post.comments.length
    }));

    console.log('Posts fetched for subreddit successfully:', posts.length);
    res.json(postsWithLikeCount);
  } catch (err) {
    console.error('Error fetching posts for subreddit:', err);
    res.status(500).json({ error: 'Failed to fetch posts for subreddit', details: err.message });
  }
});

module.exports = router;
