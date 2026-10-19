// =============================================================================
// middleware/auth.js - JWT authentication & authorization (Capstone)
// Course    : Web Data Management and Application
// Student   : Xianshu Ze  (24998025)
//
// Two guards built on the JWT system from Lab 14:
//
//   protect  - reads the JWT from the Authorization header
//              ("Bearer <token>") OR the httpOnly "jwt" cookie, verifies the
//              signature against JWT_SECRET, loads the user from the payload,
//              and attaches it to req.user. Routes wrapped in protect reject
//              anonymous visitors with 401.
//
//   adminOnly - a second, tiny guard used AFTER protect. Only users whose
//              role === 'admin' may pass (403 otherwise). This protects the
//              write endpoints for portfolio content and the admin dashboard.
// =============================================================================

const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const JWT_SECRET = process.env.JWT_SECRET;

const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Authorization header: "Bearer eyJhbGci..."
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. Fallback: the httpOnly cookie set at login (Lab 14 Challenge 2)
    else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, status: 401, message: 'Not authorized, no token' });
    }

    // 3. Verify the signature - a forged token throws JsonWebTokenError here.
    const decoded = jwt.verify(token, JWT_SECRET);

    // 4. Load the user referenced by the payload ({ id }).
    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, status: 401, message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, status: 401, message: 'Not authorized, token failed' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res
    .status(403)
    .json({ success: false, status: 403, message: 'Admin access only' });
};

module.exports = { protect, adminOnly };
