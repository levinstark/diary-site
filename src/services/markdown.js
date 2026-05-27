const fs = require('fs');
const path = require('path');
const fm = require('front-matter');
const { marked } = require('marked');

// Configure marked for Typora-like behavior
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Read a .md file, parse frontmatter, and render the body to HTML.
 * @param {string} filePath - absolute path to the .md file
 * @returns {{ title: string, date: string, tags: string[], html: string, summary: string }}
 */
function parseFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { attributes, body } = fm(raw);

  const html = marked.parse(body);

  // Summary: first ~150 chars of plain text, stripping markdown syntax loosely
  const plainText = body
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~`>]/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^```[\s\S]*?```/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
  const summary = plainText.length > 150 ? plainText.slice(0, 150) + '...' : plainText;

  // Normalize date to YYYY-MM-DD string (front-matter may parse it as a Date)
  let dateStr = '';
  const rawDate = attributes.date;
  if (rawDate) {
    const d = new Date(rawDate);
    dateStr = d.toISOString().slice(0, 10);
  }

  return {
    title: attributes.title || '',
    date: dateStr,
    tags: Array.isArray(attributes.tags) ? attributes.tags : [],
    html,
    summary,
  };
}

module.exports = { parseFile };
