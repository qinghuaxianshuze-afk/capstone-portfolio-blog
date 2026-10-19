// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/messageController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/').post(ctrl.sendMessage).get(protect, adminOnly, ctrl.getMessages);
router.route('/:id').delete(protect, adminOnly, ctrl.deleteMessage);
router.route('/:id/read').patch(protect, adminOnly, ctrl.markRead);

module.exports = router;
