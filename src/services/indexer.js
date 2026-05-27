const fs = require('fs');
const path = require('path');
const { parseFile } = require('./markdown');
const config = require('../../config');

let _cache = null;

function getContentDir() {
  return path.resolve(config.contentDir);
}

/**
 * Invalidate the cached index (called after git pull from webhook).
 */
function invalidateCache() {
  _cache = null;
}

/**
 * Walk content/ recursively and find all .md files.
 * Returns an array of { year, month, slug, filePath }.
 */
function findMarkdownFiles(dir) {
  const results = [];
  const baseDir = getContentDir();

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const relPath = path.relative(baseDir, fullPath);
        // Expected pattern: YYYY/MM-slug.md
        const parts = relPath.split(path.sep);
        if (parts.length === 2) {
          const year = parts[0];
          const filename = parts[1];
          const match = filename.match(/^(\d{2})-(.+)\.md$/);
          if (match) {
            results.push({
              year,
              month: match[1],
              slug: match[2],
              filePath: fullPath,
            });
          }
        }
      }
    }
  }

  walk(baseDir);
  return results;
}

/**
 * Build the sorted index of all diary entries.
 * Results are cached until invalidateCache() is called.
 */
function buildIndex() {
  if (_cache) return _cache;

  const files = findMarkdownFiles();
  const entries = files.map((f) => {
    const { title, date, tags, summary } = parseFile(f.filePath);

    // Normalize date to YYYY-MM-DD string (front-matter may return a Date object)
    let dateStr = '';
    if (date) {
      const d = new Date(date);
      dateStr = d.toISOString().slice(0, 10);
    } else {
      dateStr = `${f.year}-${f.month}-01`;
    }

    return {
      year: f.year,
      month: f.month,
      slug: f.slug,
      title: title || f.slug.replace(/-/g, ' '),
      date: dateStr,
      tags,
      summary,
      url: `/${f.year}/${f.month}/${f.slug}`,
    };
  });

  // Sort by date descending (newest first)
  entries.sort((a, b) => new Date(b.date) - new Date(a.date));

  _cache = entries;
  return entries;
}

module.exports = { buildIndex, invalidateCache };
