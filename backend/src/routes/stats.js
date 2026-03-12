const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../data/items.json');

let cachedStats = null;
let cachedMtimeMs = null;

// GET /api/stats
router.get('/', (req, res, next) => {
  fs.stat(DATA_PATH, (statErr, stats) => {
    if (statErr) return next(statErr);

    const mtimeMs = stats.mtimeMs;

    if (cachedStats && cachedMtimeMs === mtimeMs) {
      return res.json(cachedStats);
    }

    fs.readFile(DATA_PATH, (readErr, raw) => {
      if (readErr) return next(readErr);

      try {
        const items = JSON.parse(raw);
        const total = items.length;
        const averagePrice =
          total === 0
            ? 0
            : items.reduce((acc, cur) => acc + Number(cur.price || 0), 0) / total;

        cachedStats = { total, averagePrice };
        cachedMtimeMs = mtimeMs;

        return res.json(cachedStats);
      } catch (parseErr) {
        return next(parseErr);
      }
    });
  });
});

module.exports = router;