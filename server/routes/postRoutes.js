// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/postController');
const commentCtrl = require('../controllers/commentController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/').get(ctrl.getPosts).post(protect, adminOnly, ctrl.createPost);
router.route('/:id').get(ctrl.getPost).put(protect, adminOnly, ctrl.updatePost).delete(protect, adminOnly, ctrl.deletePost);

// Spec Phase 4: nested comment endpoints -> /api/blog/:postId/comments
router.get('/:postId/comments', commentCtrl.getComments);
router.post('/:postId/comments', protect, commentCtrl.createComment);

module.exports = router;
