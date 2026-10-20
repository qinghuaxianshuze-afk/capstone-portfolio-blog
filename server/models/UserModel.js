// =============================================================================
// models/UserModel.js
// Lab 13 - Secure User Registration (Step 1) + Challenge 1 + Challenge 2
// Course    : Web Data Management and Application
// Instructor: Ahsan Shehzad
// Student   : Xianshu Ze  (24998025)
//
// The User model is the security foundation of the blog platform. Three ideas
// make registration secure, and all three live HERE (one central place):
//
//   1. `select: false` on the password  - a plain query (User.find()/
//      findById()) NEVER returns the password hash, so it cannot leak by
//      accident through a controller that dumps the whole document.
//
//   2. A pre-save MIDDLEWARE HOOK - the hashing runs automatically right
//      before the document is written. The controller just calls
//      User.create({ ...plaintext }) and never handles the hash itself.
//      We only hash when the password was actually modified, so an unrelated
//      update (e.g. changing the email) does not re-hash an already-hashed
//      value.
//
//   3. bcrypt with a salt of cost 10 - the plaintext is never stored; the
//      unique salt + slow key-derivation defeats rainbow tables and brute
//      force (the "most important lesson" of the lab).
//
// CHALLENGE 1 (password strength): a custom validator requires the PLAINTEXT
// password to be at least 8 characters. Mongoose runs validators BEFORE the
// pre-save hook, so this checks the real user password, not the hash.
//
// CHALLENGE 2 (email sanitization): a pre-save hook lowercases the email so
// "User@Example.com" and "user@example.com" cannot become two accounts.
// =============================================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true, // schema-level normalization (kept alongside the hook)
    },
    // Capstone: role drives the adminOnly guard. The FIRST registered user
    // is promoted to admin manually (or via the seed script) - see README.
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
      validate: {
        validator: function (value) {
          // Already a bcrypt hash ($2a$/$2b$/$2y$...) -> nothing to validate.
          if (typeof value === 'string' && /^\$2[aby]\$/.test(value)) {
            return true;
          }
          return typeof value === 'string' && value.length >= 8;
        },
        message: 'Password must be at least 8 characters long',
      },
    },
  },
  { timestamps: true }
);

// -----------------------------------------------------------------------------
// CHALLENGE 2 + Step 1 hashing, combined in ONE pre-save hook.
// -----------------------------------------------------------------------------
UserSchema.pre('save', async function (next) {
  // CHALLENGE 2: sanitize the email to lowercase before saving, so casing can
  // never create duplicate accounts.
  if (this.email) {
    this.email = this.email.toLowerCase();
  }

  // Step 1: only hash if the password field has been modified (e.g. on
  // registration). Otherwise leave the existing hash untouched.
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate a salt (cost factor 10) and hash the plaintext password.
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// -----------------------------------------------------------------------------
// Lab 14 - Step 1: password comparison method.
// Called by the login controller AFTER the hash has been fetched with
// select('+password'). 'this.password' is the stored bcrypt hash.
// -----------------------------------------------------------------------------
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
