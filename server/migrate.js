// =============================================================================
// migrate.js - one-off migration to the spec-aligned schema (run once)
//   1. comments: rename legacy `content` field to `body`
//   2. projects: attach `user` (the admin) to projects created before the
//      user field existed
// Idempotent: safe to run multiple times.
// =============================================================================
require('./config/dns-srv');
require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const admin = await db.collection('users').findOne({ role: 'admin' });

  const r1 = await db.collection('comments').updateMany(
    { content: { $exists: true } },
    [{ $set: { body: '$content' } }, { $unset: 'content' }]
  );
  console.log('comments content->body migrated:', r1.modifiedCount);

  const r2 = await db.collection('projects').updateMany(
    { user: { $exists: false } },
    [{ $set: { user: admin._id } }]
  );
  console.log('projects user attached:', r2.modifiedCount);

  await mongoose.disconnect();
  console.log('MIGRATION DONE');
})().catch((e) => { console.error(e.message); process.exit(1); });
