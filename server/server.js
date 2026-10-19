// =============================================================================
// server.js - Capstone Project entry point (local development)
// Course    : Web Data Management and Application
// Instructor: Ahsan Shehzad
// Student   : Xianshu Ze  (24998025)
//
// Boot order: connect to MongoDB Atlas FIRST, then start listening.
// The Express app itself lives in app.js so the same code can also run
// serverlessly on Vercel (see api/index.js).
// =============================================================================
const connectDB = require('./config/db');
const app = require('./app');

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
