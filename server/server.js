// =============================================================================
// server.js - Capstone Project: Full-Stack Portfolio & Blog API
// Course    : Web Data Management and Application
// Instructor: Ahsan Shehzad
// Student   : Xianshu Ze  (24998025)
//
// The composition root of the API. Everything the course built up across the
// semester is wired together here:
//   - config/dns-srv.js  : campus-network SRV resolver (Lab 6), loaded FIRST
//   - dotenv             : secrets (MONGO_URI, JWT_SECRET) from .env
//   - cors / cookie-parser / express.json : HTTP plumbing
//   - /api routers       : auth, portfolio (projects, skills), blog
//                          (posts, comments), contact messages
//   - auth middleware    : JWT "protect" + "adminOnly" (Lab 14 + capstone)
//   - 404 handler + central error handler (Lab 12)
// =============================================================================

// 1. MUST be required before mongoose connects (patches dns.resolveSrv).
require('./config/dns-srv');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandlerMiddleware = require('./middleware/error');

// Route modules
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const skillRoutes = require('./routes/skillRoutes');
const messageRoutes = require('./routes/messageRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------
// CORS: allows the React front-end (different origin/port) to call this API.
// CLIENT_URL is read from .env so the same code works locally and on Render.
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (curl, Thunder Client, same-origin)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, true); // permissive for the demo deployment
    },
    credentials: true, // allow the httpOnly JWT cookie (Lab 14 Challenge 2)
  })
);
app.use(express.json());
app.use(cookieParser());

// A tiny health-check route for uptime monitors (Render pings this).
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Portfolio & Blog API is running' });
});

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------
app.use('/api/users', authRoutes);       // register / login / me
app.use('/api/projects', projectRoutes); // portfolio projects
app.use('/api/skills', skillRoutes);     // skill list
app.use('/api/messages', messageRoutes); // contact form messages
app.use('/api/posts', postRoutes);       // blog posts
app.use('/api/comments', commentRoutes); // comments on posts

// ---------------------------------------------------------------------------
// 404 for unknown API routes, then the central error handler (Lab 12)
// ---------------------------------------------------------------------------
app.all('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});
app.use(errorHandlerMiddleware);

// ---------------------------------------------------------------------------
// Boot: connect to MongoDB Atlas first, then listen
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
