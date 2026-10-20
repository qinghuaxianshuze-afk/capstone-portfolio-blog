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
    // Spec Phase 4: single post populated with author username AND all
    // associated comments in one response.
    const post = await Post.findById(req.params.id)
      .populate('author', 'username')
      .populate({ path: 'comments', populate: { path: 'author', select: 'username' } });
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

// Spec Phase 3 authorization rule: only the ORIGINAL AUTHOR of a blog post
// may update or delete it (admins may too - they run the site).
const isAuthorOrAdmin = (post, user) =>
  req_isAdmin(user) || (post.author && post.author.toString() === user._id.toString());
function req_isAdmin(user) { return user && user.role === 'admin'; }

exports.updatePost = async (req, res, next) => {
  try {
    const existing = await Post.findById(req.params.id);
    if (!existing) return next(new ErrorHandler('Post not found', 404));
    if (!isAuthorOrAdmin(existing, req.user)) {
      return next(new ErrorHandler('You are not the author of this post', 403));
    }
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: post });
  } catch (error) { next(error); }
};

exports.deletePost = async (req, res, next) => {
  try {
    const existing = await Post.findById(req.params.id);
    if (!existing) return next(new ErrorHandler('Post not found', 404));
    if (!isAuthorOrAdmin(existing, req.user)) {
      return next(new ErrorHandler('You are not the author of this post', 403));
    }
    const post = await Post.findByIdAndDelete(req.params.id);
    // Cascade: remove the post's comments too.
    const Comment = require('../models/CommentModel');
    await Comment.deleteMany({ post: req.params.id });
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) { next(error); }
};
