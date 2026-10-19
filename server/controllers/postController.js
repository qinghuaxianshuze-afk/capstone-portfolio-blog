// controllers/postController.js - blog posts CRUD (Lab 9-11 heritage)
// Public: read. Admin: write. Author is captured from req.user.
const Post = require('../models/PostModel');
const ErrorHandler = require('../utils/ErrorHandler');

exports.getPosts = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.tag) filter.tags = req.query.tag;
    const posts = await Post.find(filter)
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: posts.length, data: posts });
  } catch (error) { next(error); }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username');
    if (!post) return next(new ErrorHandler('Post not found', 404));
    res.status(200).json({ success: true, data: post });
  } catch (error) { next(error); }
};

exports.createPost = async (req, res, next) => {
  try {
    const post = await Post.create({ ...req.body, author: req.user._id });
    res.status(201).json({ success: true, data: post });
  } catch (error) { next(error); }
};

exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!post) return next(new ErrorHandler('Post not found', 404));
    res.status(200).json({ success: true, data: post });
  } catch (error) { next(error); }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return next(new ErrorHandler('Post not found', 404));
    // Cascade: remove the post's comments too.
    const Comment = require('../models/CommentModel');
    await Comment.deleteMany({ post: req.params.id });
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) { next(error); }
};
