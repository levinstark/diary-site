require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  sessionSecret: process.env.SESSION_SECRET || 'change-me-in-production',
  sitePassword: process.env.SITE_PASSWORD || 'admin',
  webhookSecret: process.env.WEBHOOK_SECRET || '',
  contentDir: process.env.CONTENT_DIR || 'content',
};
