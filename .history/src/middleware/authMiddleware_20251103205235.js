const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // Expect header like: "Bearer eyJhbGciOi..."
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // we can attach admin id to req
    req.adminId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token failed / expired' });
  }
}

module.exports = authMiddleware;
