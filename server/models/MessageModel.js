// models/MessageModel.js - Contact-form submissions
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], trim: true, lowercase: true },
    subject: { type: String, default: '' },
    message: { type: String, required: [true, 'Message is required'] },
    read: { type: Boolean, default: false }, // admin marks messages as read
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', MessageSchema);
