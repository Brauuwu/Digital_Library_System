const jwt = require('jsonwebtoken');
const { query } = require('../db');

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const rows = await query('SELECT * FROM NguoiDung WHERE ID_NguoiDung = ?', [payload.id]);
    const user = rows && rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    req.user = user; // plain object
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Auth failed' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.Role === 'admin') return next();
  return res.status(403).json({ message: 'Admin only' });
};

module.exports = { authenticate, isAdmin };
