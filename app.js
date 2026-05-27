const express = require('express');
const session = require('express-session');
const path = require('path');
const config = require('./config');

const app = express();

// Trust reverse proxy (Caddy) for secure cookies and correct client IP
app.set('trust proxy', 1);

// ── Static files (no auth required for CSS) ──
app.use(express.static(path.join(__dirname, 'public')));

// ── Session ──
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// ── URL-encoded body parsing (for login form) ──
app.use(express.urlencoded({ extended: false }));

// ── EJS ──
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Webhook route (before auth gate, uses raw body) ──
const webhookRouter = require('./src/routes/webhook');
app.use('/webhook', express.raw({ type: 'application/json' }), webhookRouter);

// ── Auth routes (before auth gate) ──
const authRouter = require('./src/routes/auth');
app.use('/', authRouter);

// ── Auth gate for everything below ──
const { requireUnlock } = require('./src/middleware/auth');
app.use(requireUnlock);

// ── Diary routes ──
const diaryRouter = require('./src/routes/diary');
app.use('/', diaryRouter);

// ── 404 catch-all ──
app.use((req, res) => {
  res.status(404).render('404');
});

// ── Start ──
app.listen(config.port, () => {
  console.log(`diary-site running on http://localhost:${config.port}`);
});
