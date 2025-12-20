require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

/**
 * CORS
 * Render env example:
 * FRONT_ORIGIN=http://localhost:5173,https://your-frontend.vercel.app
 */
const allowedOrigins = (process.env.FRONT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (curl/postman/server-to-server)
    if (!origin) return cb(null, true);
    return cb(null, allowedOrigins.includes(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Optional: handle preflight
app.options('*', cors());

/**
 * Body parsers
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Static uploads
 */
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

/**
 * Routes
 */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/complaints', require('./routes/complaints'));

/**
 * Health check
 */
app.get('/api/health', (req, res) => res.json({ ok: true }));

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Server error' });
});

/**
 * DB + server start
 */
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('Missing MONGO_URI in env');
  process.exit(1);
}

mongoose.set('strictQuery', true);

mongoose.connect(MONGO_URI, { autoIndex: true })
  .then(() => {
    console.log('MongoDB connected');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err?.message || err);
    process.exit(1);
  });
