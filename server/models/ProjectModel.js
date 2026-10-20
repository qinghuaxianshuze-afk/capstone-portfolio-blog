// models/ProjectModel.js - Portfolio project entries (admin-managed)
const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    imageUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    repoUrl: { type: String, default: '' },
    tags: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    // Spec Phase 1: every project belongs to a user (the admin author).
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', ProjectSchema);
