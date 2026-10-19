// =============================================================================
// utils/generateToken.js
// Lab 14 - Step 2: A Reusable Token Generator
// Course    : Web Data Management and Application
// Instructor: Ahsan Shehzad
// Student   : Xianshu Ze  (24998025)
//
// A tiny utility with ONE job: sign a JWT for a given user id.
//
// Why a separate file? The login controller should not care HOW a token is
// built (payload shape, expiry, secret handling). Any future endpoint that
// needs to issue a token (e.g. a refresh endpoint in Chapter 8) reuses this
// function instead of duplicating jwt.sign(...) calls.
//
// The secret comes from environment variables (JWT_SECRET in .env) so it is
// NEVER hardcoded in source control. If it is missing, we fail fast with a
// clear message instead of silently signing tokens with `undefined`.
// =============================================================================

const jwt = require('jsonwebtoken');

// Load secret securely from environment variables (see .env / .env.example)
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is not defined. Add JWT_SECRET=<a long random string> to your .env file.'
  );
}

/**
 * Sign a JWT whose payload is { id: userId }.
 * @param {string} userId - the Mongo _id of the authenticated user
 * @returns {string} a signed JWT (header.payload.signature)
 */
const generateToken = (userId) => {
  // Payload contains the user ID - this is the "stateless digital ID":
  // anyone can DECODE it, but only holders of the secret can sign it.
  const payload = { id: userId };

  // Token expires in 30 days (then the client must log in again)
  const options = { expiresIn: '30d' };

  // Signs the token using the secret -> "header.payload.signature"
  return jwt.sign(payload, JWT_SECRET, options);
};

module.exports = generateToken;
