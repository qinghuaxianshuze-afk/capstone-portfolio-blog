// controllers/messageController.js - contact form
// Public: anyone can SEND a message. Admin: list/mark-read/delete.
const Message = require('../models/MessageModel');
const ErrorHandler = require('../utils/ErrorHandler');

exports.sendMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return next(new ErrorHandler('Name, email and message are required', 400));
    }
    const msg = await Message.create({ name, email, subject, message });
    res.status(201).json({ success: true, message: 'Message sent successfully', data: msg });
  } catch (error) { next(error); }
};

exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) { next(error); }
};

exports.markRead = async (req, res, next) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!msg) return next(new ErrorHandler('Message not found', 404));
    res.status(200).json({ success: true, data: msg });
  } catch (error) { next(error); }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const msg = await Message.findByIdAndDelete(req.params.id);
    if (!msg) return next(new ErrorHandler('Message not found', 404));
    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (error) { next(error); }
};
