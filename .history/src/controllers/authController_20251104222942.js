// src/controllers/authController.js
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// accept either username or email in the same field
// frontend still sends { username: '...' , password: '...' }
const login = async (req, res) => {
  try {
    const { username, password } = req.body; // "username" may be email too
    if (!username || !password) {
      return res.status(400).json({ message: 'Missing credentials' });
    }

    const admin = await Admin.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await admin.validatePassword(password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      admin: { id: admin._id, username: admin.username, email: admin.email || null }
    });
  } catch (e) {
    console.error('login error', e);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login, getMe };
