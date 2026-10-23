// ============================================================
//  EcoTrack – Express Server Entry Point
//  Loads env vars, wires up middleware, and mounts routes.
// ============================================================

// Load environment variables from .env FIRST, before anything else
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const rateLimit = require('express-rate-limit');

// Import the AI routes
const aiRoutes = require('./routes/aiRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ────────────────────────────────────────────────────
// Only allow requests from the configured frontend origin.
// During development this is usually http://localhost:5173 (Vite).
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: true, // Allow frontend during local development
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
}));

// ── Body Parser ─────────────────────────────────────────────
// Parse incoming JSON bodies (e.g. { footprintData: { ... } })
app.use(express.json());

// Request logger for easy debugging
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  }
  next();
});

// ── Rate Limiter ─────────────────────────────────────────────
// Protects the Gemini API key from excessive usage.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 100,                  // max requests per window per IP
  standardHeaders: true,     // send RateLimit-* headers in responses
  legacyHeaders: false,      // disable X-RateLimit-* legacy headers
  message: {
    success: false,
    error: 'Too many requests. Please wait a few minutes and try again.',
  },
});

// Apply the rate limiter to all API routes
app.use('/api', limiter);

// ── Routes ───────────────────────────────────────────────────

// Health-check endpoint – quick way to verify the server is up
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'EcoTrack server running' });
});

const path = require('path');
const fs   = require('fs');

// AI routes (recommendations + chat)
// All routes in aiRoutes.js will be prefixed with /api/ai
app.use('/api/ai', aiRoutes);

// ── Serve Built Frontend in Production (Unified Hosting) ─────
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// ── 404 Catch-all for unmatched API requests ─────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ── Global Error Handler ─────────────────────────────────────
// Catches any unhandled errors thrown by route handlers
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('Unhandled server error:', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('🌿 ====================================');
  console.log(`🌿  EcoTrack Server is running`);
  console.log(`🌿  Port    : ${PORT}`);
  console.log(`🌿  CORS    : ${allowedOrigin}`);
  console.log(`🌿  Health  : http://localhost:${PORT}/api/health`);
  console.log('🌿 ====================================');

  // Warn the developer if the API key hasn't been configured yet
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'your_gemini_api_key_here') {
    console.warn('');
    console.warn('⚠️  GEMINI_API_KEY is not set.');
    console.warn('   Copy server/.env.example → server/.env');
    console.warn('   and add your key from https://aistudio.google.com/app/apikey');
    console.warn('   The server will use fallback responses until the key is added.');
    console.warn('');
  } else {
    console.log(`🤖  Gemini model: ${process.env.GEMINI_MODEL || 'gemini-1.5-flash'}`);
  }
});
