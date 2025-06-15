
const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');

// GET all news
router.get('/', async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      orderBy: { publishedAt: 'desc' }
    });
    res.json(news);
  } catch (err) {
    console.error('GET / Error:', err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// GET a single news item by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const newsItem = await prisma.news.findUnique({
      where: { id: Number(id) }
    });
    if (!newsItem) return res.status(404).json({ error: 'News item not found' });
    res.json(newsItem);
  } catch (err) {
    console.error('GET /:id Error:', err);
    res.status(500).json({ error: 'Failed to fetch news item' });
  }
});

// POST a new news item
router.post('/', async (req, res) => {
  const { title, summary, content, source, url, imageUrl, category, publishedAt } = req.body;
  try {
    const newNews = await prisma.news.create({
      data: {
        title,
        summary,
        content,
        source,
        url,
        imageUrl,
        category,
        publishedAt: new Date(publishedAt)
      }
    });
    res.status(201).json(newNews);
  } catch (err) {
    console.error('POST / Error:', err);
    res.status(500).json({ error: 'Failed to create news item', details: err.message });
  }
});

// DELETE a news item by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const newsItem = await prisma.news.findUnique({
      where: { id: Number(id) }
    });
    if (!newsItem) return res.status(404).json({ error: 'News item not found' });
    
    await prisma.news.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'News item deleted successfully' });
  } catch (err) {
    console.error('DELETE /:id Error:', err);
    res.status(500).json({ error: 'Failed to delete news item' });
  }
});

module.exports = router;
