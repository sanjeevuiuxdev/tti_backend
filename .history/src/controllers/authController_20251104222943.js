const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// POST /api/auth/login
// body: { username, password }
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isValid = await admin.validatePassword(password);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // create JWT
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/auth/me
// header: Authorization: Bearer <token>
const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select('-passwordHash');
    if (!admin) return res.status(404).json({ message: 'Not found' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  login,
  getMe,
};
