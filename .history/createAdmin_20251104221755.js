const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const Admin = require('./src/models/Admin');

(async () => {
  await connectDB();

  const admin = new Admin({
    username: 'admin@gmail.com',
    passwordHash: 'temp', // will be replaced
  });

  await admin.setPassword('yourStrongPassword123');
  await admin.save();

  console.log('Admin created:', admin.username);
  process.exit(0);
})();
