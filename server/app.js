// =============================================================================
// app.js - the Express application (no server.listen here!)
// Split out from server.js so the SAME app can run:
//   - locally / on a classic host : server.js imports it and calls .listen()
//   - on Vercel (serverless)      : api/index.js imports it as a handler
// =============================================================================
require('./config/dns-srv');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // spec Phase 5: security headers
const cookieParser = require('cookie-parser');
require('dotenv').config();

const errorHandlerMiddleware = require('./middleware/error');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const skillRoutes = require('./routes/skillRoutes');
const messageRoutes = require('./routes/messageRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

// CORS: lets the React front-end (different origin) call this API.
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, true); // permissive for the demo deployment
    },
    credentials: true,
  })
);
app.use(helmet()); // spec Phase 5: secure HTTP headers
app.use(express.json());
app.use(cookieParser());

// Health check.
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Portfolio & Blog API is running' });
});

// API routes
app.use('/api/users', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/blog', postRoutes);   // spec alias: /api/blog == /api/posts
app.use('/api/comments', commentRoutes);

// spec alias: POST /api/contact == POST /api/messages (contact form)
const { sendMessage } = require('./controllers/messageController');
app.post('/api/contact', sendMessage);

// 404 + central error handler (Lab 12 contract)
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});
app.use(errorHandlerMiddleware);

module.exports = app;
