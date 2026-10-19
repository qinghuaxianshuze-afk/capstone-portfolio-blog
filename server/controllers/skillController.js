// controllers/skillController.js - skills CRUD (same shape as projects)
const Skill = require('../models/SkillModel');
const ErrorHandler = require('../utils/ErrorHandler');

exports.getSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: skills.length, data: skills });
  } catch (error) { next(error); }
};

exports.createSkill = async (req, res, next) => {
  try {
    const skill = await Skill.create(req.body);
    res.status(201).json({ success: true, data: skill });
  } catch (error) { next(error); }
};

exports.deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return next(new ErrorHandler('Skill not found', 404));
    res.status(200).json({ success: true, message: 'Skill deleted' });
  } catch (error) { next(error); }
};
