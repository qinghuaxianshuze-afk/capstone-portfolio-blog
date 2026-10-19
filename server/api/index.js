// =============================================================================
// api/index.js - Vercel serverless entry point.
// Vercel turns every file under /api into a cloud function. This one lazily
// connects Mongoose (the promise is cached between warm invocations) and then
// hands the request to the shared Express app.
// =============================================================================
require('dotenv').config();
const app = require('../app');
const connectDB = require('../config/db');

let dbReady = null;

module.exports = async (req, res) => {
  if (!dbReady) {
    dbReady = connectDB().catch((err) => {
      dbReady = null; // allow a retry on the next request
      throw err;
    });
  }
  try {
    await dbReady;
  } catch (err) {
    res.status(500).json({ success: false, status: 500, message: 'Database unavailable: ' + err.message });
    return;
  }
  return app(req, res);
};
