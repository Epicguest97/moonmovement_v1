
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const commentsRouter = require('./routes/comments');
const communityRouter = require('./routes/community');
const postRouter = require('./routes/post');
const newsRouter = require('./routes/news');
const authRoutes = require('./routes/auth');
const userSettingsRoutes = require('./routes/userSettings');
const startupsRouter = require('./routes/startups');
const chatRoutes = require('./routes/chat');
const eventsRoutes = require('./routes/events');

app.get("/", (req, res) => {
  res.send("Reddit backend running");
});

app.use('/api/posts', require('./routes/post'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth', userSettingsRoutes);
app.use('/api/comments', require('./routes/comments'));
app.use('/api/news', require('./routes/news'));
app.use('/api/startups', require('./routes/startups'));
app.use('/api/community', require('./routes/community'));
app.use('/api/chat', chatRoutes);
app.use('/api/events', eventsRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
