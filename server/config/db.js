// =============================================================================
// config/db.js - MongoDB Atlas connection (Mongoose)
// =============================================================================
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MONGO_URI comes from .env (never committed). The database name is part
    // of the URI: ...mongodb.net/<dbname>?retryWrites=true&w=majority
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected:', conn.connection.host);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

module.exports = connectDB;
