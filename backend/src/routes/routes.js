
const express = require('express');
const router = express.Router();

// Import route modules
const postRoutes = require('./post');
const authRoutes = require('./auth');
const commentRoutes = require('./comments');
const newsRoutes = require('./news');
const startupsRoutes = require('./startups');
const searchRoutes = require('./search');
const communityRoutes = require('./community');
const chatRoutes = require('./chat');
const userActivityRoutes = require('./userActivity');
const userSettingsRoutes = require('./userSettings');
const moderationRoutes = require('./moderation');

// Use routes
router.use('/posts', postRoutes);
router.use('/auth', authRoutes);
router.use('/comments', commentRoutes);
router.use('/news', newsRoutes);
router.use('/startups', startupsRoutes);
router.use('/search', searchRoutes);
router.use('/community', communityRoutes);
router.use('/chat', chatRoutes);
router.use('/user-activity', userActivityRoutes);
router.use('/user-settings', userSettingsRoutes);
router.use('/moderation', moderationRoutes);

module.exports = router;
