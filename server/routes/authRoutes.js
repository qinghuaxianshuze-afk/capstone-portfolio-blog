// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser); // POST /api/users/register
router.post('/login', loginUser);        // POST /api/users/login
router.get('/me', protect, getMe);       // GET  /api/users/me (JWT required)

module.exports = router;
