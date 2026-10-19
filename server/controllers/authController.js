// controllers/authController.js - register / login / me (Labs 13-14 heritage)
const User = require('../models/UserModel');
const ErrorHandler = require('../utils/ErrorHandler');
const generateToken = require('../utils/generateToken');

// POST /api/users/register
exports.registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return next(new ErrorHandler('Please provide username, email and password', 400));
    }
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return next(new ErrorHandler('User with that email or username already exists', 400));
    }
    // Password hashing happens in the pre-save hook (Lab 13).
    const user = await User.create({ username, email, password });
    res.status(201).json({
      success: true,
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/login - generic 401 on any failure (Lab 14)
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email ? String(email).toLowerCase() : email }).select('+password');
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      // Challenge 2: also park the token in an httpOnly cookie.
      res.cookie('jwt', token, {
        httpOnly: true,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      res.status(200).json({
        success: true,
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token,
      });
    } else {
      return next(new ErrorHandler('Invalid email or password', 401));
    }
  } catch (error) {
    next(error);
  }
};

// GET /api/users/me - who am I? (used by the front-end after login)
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, user });
};
