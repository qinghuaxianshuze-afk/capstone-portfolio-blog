// =============================================================================
// netlify/api.js - Netlify Functions entry (serverless deployment target).
// Wraps the SAME Express app used in local development (app.js) with
// serverless-http, and lazily connects Mongoose on first invocation.
// netlify.toml routes /api/* and the health check here.
// =============================================================================
require('./env-inject'); // must run before app reads process.env
const serverless = require('serverless-http');
const app = require('../app');
const connectDB = require('../config/db');

let dbPromise = null;
const ensureDb = () => {
  if (!dbPromise) {
    dbPromise = connectDB().catch((err) => {
      dbPromise = null; // allow retry on next request
      throw err;
    });
  }
  return dbPromise;
};

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  try {
    await ensureDb();
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, status: 500, message: 'Database unavailable: ' + err.message }),
    };
  }
  return handler(event, context);
};
