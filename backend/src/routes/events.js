const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authenticateToken } = require('../middleware/auth');

// Get all events
router.get('/', async (req, res) => {
  try {
    const { category, upcoming } = req.query;
    
    let whereClause = { isActive: true };
    
    if (category && category !== 'all') {
      whereClause.category = category;
    }
    
    // Only include upcoming events if specified in query
    if (upcoming === 'true') {
      whereClause.eventDate = {
        gte: new Date()
      };
    }
    
    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        organizer: {
          select: { id: true, username: true }
        },
        registrations: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          }
        },
        _count: {
          select: { registrations: true }
        }
      },
      orderBy: { eventDate: 'asc' }
    });
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: { id: true, username: true }
        },
        registrations: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          }
        },
        _count: {
          select: { registrations: true }
        }
      }
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create new event
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, location, eventDate, eventTime, maxAttendees, imageUrl, category } = req.body;
    
    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        eventDate: new Date(eventDate),
        eventTime,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
        imageUrl,
        category,
        organizerId: req.user.userId
      },
      include: {
        organizer: {
          select: { id: true, username: true }
        },
        _count: {
          select: { registrations: true }
        }
      }
    });
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Register for event
router.post('/:id/register', authenticateToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = req.user.userId;
    
    // Check if event exists and is active
    const event = await prisma.event.findFirst({
      where: { id: eventId, isActive: true },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found or inactive' });
    }
    
    // Check if event is full
    if (event.maxAttendees && event._count.registrations >= event.maxAttendees) {
      return res.status(400).json({ error: 'Event is full' });
    }
    
    // Check if user is already registered
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId
        }
      }
    });
    
    if (existingRegistration) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }
    
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        userId
      },
      include: {
        user: {
          select: { id: true, username: true }
        },
        event: {
          select: { id: true, title: true }
        }
      }
    });
    
    res.status(201).json(registration);
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ error: 'Failed to register for event' });
  }
});

// Unregister from event
router.delete('/:id/register', authenticateToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = req.user.userId;
    
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId
        }
      }
    });
    
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    
    await prisma.eventRegistration.delete({
      where: {
        eventId_userId: {
          eventId,
          userId
        }
      }
    });
    
    res.json({ message: 'Successfully unregistered from event' });
  } catch (error) {
    console.error('Error unregistering from event:', error);
    res.status(500).json({ error: 'Failed to unregister from event' });
  }
});

// Get user's registered events
router.get('/user/registrations', authenticateToken, async (req, res) => {
  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: { userId: req.user.userId },
      include: {
        event: {
          include: {
            organizer: {
              select: { id: true, username: true }
            },
            _count: {
              select: { registrations: true }
            }
          }
        }
      },
      orderBy: {
        event: { eventDate: 'asc' }
      }
    });
    
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    res.status(500).json({ error: 'Failed to fetch user registrations' });
  }
});

module.exports = router;
