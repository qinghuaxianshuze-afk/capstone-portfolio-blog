// =============================================================================
// seed.js - populate the database with portfolio content (run once)
//   node seed.js
// Idempotent: existing collections are cleared first, then re-filled.
// =============================================================================
require('./config/dns-srv');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/UserModel');
const Project = require('./models/ProjectModel');
const Skill = require('./models/SkillModel');
const Post = require('./models/PostModel');
const Comment = require('./models/CommentModel');
const Message = require('./models/MessageModel');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');

  await Promise.all([
    Project.deleteMany({}),
    Skill.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    Message.deleteMany({}),
  ]);

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) { console.log('No admin user found - register one first.'); process.exit(1); }

  await Project.create([
    { title: 'Achievement Replay Generator', description: 'A gamified "settlement screen" video generator: turn a week of activity data into a shareable replay clip with animated stats, built with Node.js and canvas rendering.', tags: ['Node.js', 'Canvas', 'Video'], featured: true },
    { title: 'Desktop Pet (Snow Ghost Doll)', description: 'A live2D-style desktop companion extracted from a classic game: custom UE4 pak decryption, sprite-grid decoding, and a lightweight Electron-free Win32 tray pet.', tags: ['Reverse Engineering', 'UE4', 'Desktop App'], featured: true },
    { title: 'Hospital Appointment Assistant', description: 'An automation tool that monitors released clinic slots and grabs an appointment the instant one opens, with retry queues and captcha-free session reuse.', tags: ['Python', 'Automation', 'HTTP'], featured: false },
    { title: 'Karst Landscape Desktop Effect', description: 'A 3D desktop wallpaper effect: karst limestone silhouettes over shimmering water, rendered in real time with WebGL shaders.', tags: ['WebGL', 'Shaders', '3D'] },
    { title: 'Blog REST API (Course Labs 9-14)', description: 'The back-end you are looking at: Express + Mongoose + JWT auth, MVC architecture, centralized error handling, and bcrypt password security.', tags: ['Express', 'MongoDB', 'JWT'] },
  ]);

  await Skill.create([
    { name: 'JavaScript / Node.js', level: 'advanced', category: 'language' },
    { name: 'React', level: 'intermediate', category: 'frontend' },
    { name: 'MongoDB / Mongoose', level: 'intermediate', category: 'database' },
    { name: 'Python', level: 'advanced', category: 'language' },
    { name: 'SQL / MySQL', level: 'intermediate', category: 'database' },
    { name: 'Git & GitHub', level: 'intermediate', category: 'tooling' },
    { name: 'HTML / CSS', level: 'advanced', category: 'frontend' },
    { name: 'WebGL / Canvas', level: 'beginner', category: 'graphics' },
  ]);

  const p1 = await Post.create({
    title: 'Why I Chose Computer Science',
    content: 'When I first watched a small script of mine automate a task that used to eat my whole afternoon, I realised programming is the closest thing to a superpower a student can get. That moment - a few dozen lines saving hours - is why I chose Computer Science at Shenyang Normal University, and why I keep building side projects between coursework: replay generators, desktop pets, appointment grabbers. Each one taught me something the syllabus could not.',
    category: 'education', tags: ['personal', 'learning'], author: admin._id,
  });
  const p2 = await Post.create({
    title: 'What Building a REST API From Scratch Taught Me',
    content: 'Over this semester we grew a blog API step by step: plain Express routes, then Mongoose models, then validation, MVC refactoring, centralized error handling, and finally bcrypt + JWT authentication. The biggest lesson was architectural: handling errors in ONE place instead of scattered try/catch blocks, and keeping secrets (password hashes, JWT signing keys) out of every default query. Security is not a feature you bolt on - it is a set of defaults you design in.',
    category: 'technology', tags: ['api', 'node', 'security'], author: admin._id,
  });

  await Comment.create([
    { post: p1._id, author: admin._id, content: 'The automation moment resonates - that is exactly how I got hooked too.' },
    { post: p2._id, author: admin._id, content: 'Centralized error handling changed how I read other people\u2019s back-end code.' },
  ]);

  await Message.create([
    { name: 'Qinghua Zhang', email: 'recruiter@example.com', subject: 'Internship enquiry', message: 'Saw your portfolio - would you be interested in a summer web-development internship?' },
  ]);

  const counts = {
    projects: await Project.countDocuments(),
    skills: await Skill.countDocuments(),
    posts: await Post.countDocuments(),
    comments: await Comment.countDocuments(),
    messages: await Message.countDocuments(),
  };
  console.log('SEED DONE:', JSON.stringify(counts));
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
