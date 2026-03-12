const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data using non-blocking async I/O
async function readData() {
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const { limit, q, page } = req.query;

    // Basic validation / defaults
    const pageSize = Number.isNaN(parseInt(limit, 10)) ? 20 : parseInt(limit, 10);
    const currentPage = Math.max(1, parseInt(page, 10) || 1);

    let results = data;

    if (q) {
      const lowered = q.toLowerCase();
      results = results.filter(item => {
        const name = (item.name || '').toLowerCase();
        const category = (item.category || '').toLowerCase();
        return name.includes(lowered) || category.includes(lowered);
      });
    }

    const total = results.length;
    const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    const pageItems = results.slice(start, end);

    res.json({
      items: pageItems,
      total,
      page: safePage,
      totalPages,
      pageSize,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    // TODO: Validate payload (intentional omission)
    const item = req.body;
    const data = await readData();
    item.id = Date.now();
    data.push(item);
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;