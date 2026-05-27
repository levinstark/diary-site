const crypto = require('crypto');
const express = require('express');
const config = require('../../config');
const { pullContent } = require('../services/git');
const { invalidateCache } = require('../services/indexer');

const router = express.Router();

/**
 * POST /webhook
 * Receives GitHub push events, verifies HMAC signature, and runs git pull.
 */
router.post('/', (req, res) => {
  // Verify signature
  const signature = req.headers['x-hub-signature-256'];
  if (!signature || !config.webhookSecret) {
    return res.status(403).json({ error: 'missing signature or webhook secret not configured' });
  }

  const computed = 'sha256=' + crypto
    .createHmac('sha256', config.webhookSecret)
    .update(req.body)
    .digest('hex');

  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed))) {
      return res.status(403).json({ error: 'invalid signature' });
    }
  } catch {
    return res.status(403).json({ error: 'invalid signature' });
  }

  // Pull content
  pullContent()
    .then((result) => {
      invalidateCache();
      console.log('Webhook: git pull completed', result);
      res.json({ ok: true, ...result });
    })
    .catch((err) => {
      console.error('Webhook: git pull failed', err);
      res.status(500).json({ error: err.message });
    });
});

module.exports = router;
