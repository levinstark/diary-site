const crypto = require('crypto');
const config = require('../../config');

/**
 * Middleware: require the session to be unlocked.
 * Skips /webhook and /login routes (those are registered before this).
 */
function requireUnlock(req, res, next) {
  if (req.session && req.session.unlocked) {
    return next();
  }
  res.redirect('/login');
}

/**
 * Constant-time password comparison (prevents timing attacks).
 */
function checkPassword(input) {
  const expected = config.sitePassword;
  const inputBuf = Buffer.from(input);
  const expectedBuf = Buffer.from(expected);

  if (inputBuf.length !== expectedBuf.length) {
    // Still do constant-time comparison to avoid length leak
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(expected));
    return false;
  }

  return crypto.timingSafeEqual(inputBuf, expectedBuf);
}

module.exports = { requireUnlock, checkPassword };
