// routes/projectRoutes.js - public reads, admin writes
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/').get(ctrl.getProjects).post(protect, adminOnly, ctrl.createProject);
router.route('/:id').get(ctrl.getProject).put(protect, adminOnly, ctrl.updateProject).delete(protect, adminOnly, ctrl.deleteProject);

module.exports = router;
