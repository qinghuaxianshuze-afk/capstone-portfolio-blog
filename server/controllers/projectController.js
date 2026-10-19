// controllers/projectController.js - portfolio projects CRUD
// Public: GET list / GET one.  Admin: create / update / delete.
const Project = require('../models/ProjectModel');
const ErrorHandler = require('../utils/ErrorHandler');

exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) { next(error); }
};

exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(new ErrorHandler('Project not found', 404));
    res.status(200).json({ success: true, data: project });
  } catch (error) { next(error); }
};

exports.createProject = async (req, res, next) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error) { next(error); }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!project) return next(new ErrorHandler('Project not found', 404));
    res.status(200).json({ success: true, data: project });
  } catch (error) { next(error); }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return next(new ErrorHandler('Project not found', 404));
    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (error) { next(error); }
};
