// controllers/commentController.js - comments on blog posts
// Public: read comments of a post. Logged-in users: add one. Admin: delete any.
const Comment = require('../models/CommentModel');
const Post = require('../models/PostModel');
const ErrorHandler = require('../utils/ErrorHandler');

exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: comments.length, data: comments });
  } catch (error) { next(error); }
};

exports.createComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return next(new ErrorHandler('Post not found', 404));
    const comment = await Comment.create({
      post: req.params.postId,
      author: req.user._id,
      content: req.body.content,
    });
    res.status(201).json({ success: true, data: comment });
  } catch (error) { next(error); }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return next(new ErrorHandler('Comment not found', 404));
    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) { next(error); }
};
