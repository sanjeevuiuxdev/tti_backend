const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// POST /api/auth/login
// body: { username, password }
const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
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
