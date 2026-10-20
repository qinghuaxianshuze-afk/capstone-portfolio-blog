// routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/commentController');
const { protect, adminOnly } = require('../middleware/auth');

// /api/comments/post/:postId  - list comments for one post
router.get('/post/:postId', ctrl.getComments);
// /api/comments/post/:postId  - add a comment (logged-in users)
router.post('/post/:postId', protect, ctrl.createComment);
// /api/comments/:id           - delete (admin)
router.delete('/:id', protect, adminOnly, ctrl.deleteComment);


module.exports = router;
