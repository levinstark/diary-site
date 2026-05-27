const express = require('express');
const { checkPassword } = require('../middleware/auth');

const router = express.Router();

// GET /login — show login form
router.get('/login', (req, res) => {
  if (req.session && req.session.unlocked) {
    return res.redirect('/');
  }
  res.render('login', { error: req.query.error !== undefined });
});

// POST /login — verify password
router.post('/login', (req, res) => {
  const { password } = req.body;

  if (password && checkPassword(password)) {
    req.session.unlocked = true;
    return res.redirect('/');
  }

  res.redirect('/login?error=1');
});

// GET /logout — destroy session
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
