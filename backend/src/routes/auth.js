const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { HoTen, Email, SoDienThoai, DiaChi, Password } = req.body;
  try {
    const hash = await bcrypt.hash(Password, 10);
    const sql = `INSERT INTO NguoiDung (HoTen, Email, SoDienThoai, DiaChi, Password) VALUES (?, ?, ?, ?, ?)`;
    const r = await query(sql, [HoTen, Email, SoDienThoai || null, DiaChi || null, hash]);
    const id = r.insertId || r.ID_NguoiDung || null;
    const out = { ID_NguoiDung: id, HoTen, Email, SoDienThoai, DiaChi, Role: 'user' };
    res.json({ user: out });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { Email, Password } = req.body;
  try {
    const rows = await query('SELECT * FROM NguoiDung WHERE Email = ? LIMIT 1', [Email]);
    const user = rows && rows[0];
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.Password || user.Password === '!') {
      return res.status(400).json({ message: 'Tài khoản này chưa đặt mật khẩu. Vui lòng đặt lại mật khẩu.' });
    }
    const provided = typeof Password === 'string' ? Password.trim() : Password;
    if (process.env.NODE_ENV !== 'production') {
      try { console.debug('[auth/login] attempt', { Email, providedLength: (provided||'').length, storedHashStartsWith: (user.Password||'').slice(0,6) }); } catch (e) {}
    }
    const ok = await bcrypt.compare(provided, user.Password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.ID_NguoiDung }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { ID_NguoiDung: user.ID_NguoiDung, HoTen: user.HoTen, Email: user.Email, Role: user.Role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
