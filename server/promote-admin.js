// One-off utility: promote a user to admin (capstone seeding helper)
require('./config/dns-srv');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/UserModel');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const email = process.argv[2];
  const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
  console.log(user ? `PROMOTED: ${user.username} -> admin` : 'USER NOT FOUND');
  await mongoose.disconnect();
})();
