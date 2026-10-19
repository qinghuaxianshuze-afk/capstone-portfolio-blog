// routes/skillRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/skillController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/').get(ctrl.getSkills).post(protect, adminOnly, ctrl.createSkill);
router.route('/:id').delete(protect, adminOnly, ctrl.deleteSkill);

module.exports = router;
