// models/PostModel.js - BlogPost model (spec Phase 1). Collection kept
// as 'posts' so existing data is reused.
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    content: { type: String, required: [true, 'Content is required'] },
    category: {
      type: String,
      enum: ['technology', 'lifestyle', 'education', 'other'],
      default: 'other',
    },
    tags: { type: [String], default: [] },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Virtual 'comments': lets getPost populate() every comment attached to a
// post without storing ids on the post itself (spec Phase 4).
PostSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
});
PostSchema.set('toJSON', { virtuals: true });
PostSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('BlogPost', PostSchema, 'posts');
