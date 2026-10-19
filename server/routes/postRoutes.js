// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/postController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/').get(ctrl.getPosts).post(protect, adminOnly, ctrl.createPost);
router.route('/:id').get(ctrl.getPost).put(protect, adminOnly, ctrl.updatePost).delete(protect, adminOnly, ctrl.deletePost);

module.exports = router;
