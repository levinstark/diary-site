const express = require('express');
const path = require('path');
const { buildIndex } = require('../services/indexer');
const { parseFile } = require('../services/markdown');
const config = require('../../config');

const router = express.Router();

// GET / — diary list
router.get('/', (req, res) => {
  const entries = buildIndex();
  res.render('list', { entries });
});

// GET /:year/:month/:slug — diary detail
router.get('/:year/:month/:slug', (req, res, next) => {
  const { year, month, slug } = req.params;
  const filePath = path.resolve(config.contentDir, year, `${month}-${slug}.md`);

  try {
    const { title, date, tags, html } = parseFile(filePath);

    // Find prev/next from index
    const entries = buildIndex();
    const currentIdx = entries.findIndex(
      (e) => e.year === year && e.month === month && e.slug === slug
    );
    const prev = currentIdx > 0 ? entries[currentIdx - 1] : null;
    const next = currentIdx < entries.length - 1 ? entries[currentIdx + 1] : null;

    res.render('detail', {
      title,
      date,
      tags,
      html,
      prev,
      next,
    });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return next();
    }
    next(err);
  }
});

module.exports = router;
