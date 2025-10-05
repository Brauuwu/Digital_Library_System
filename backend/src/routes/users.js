const express = require('express');
const { query } = require('../db');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();
const bcrypt = require('bcrypt');

router.get('/me', authenticate, async (req, res) => {
  const u = req.user;
  res.json({ ID_NguoiDung: u.ID_NguoiDung, HoTen: u.HoTen, Email: u.Email, SoDienThoai: u.SoDienThoai, DiaChi: u.DiaChi, Role: u.Role });
});

router.put('/me', authenticate, async (req, res) => {
  try {
    const data = { ...req.body };
    const updates = [];
    const params = [];
    if (data.Password) {
      data.Password = await bcrypt.hash(data.Password, 10);
    }
    // allowed fields
    const fields = ['HoTen', 'Email', 'SoDienThoai', 'DiaChi', 'Password', 'Role'];
    for (const f of fields) {
      if (data[f] !== undefined) {
        updates.push(`${f} = ?`);
        params.push(data[f]);
      }
    }
    if (updates.length === 0) return res.json({});
    params.push(req.user.ID_NguoiDung);
    const sql = `UPDATE NguoiDung SET ${updates.join(', ')} WHERE ID_NguoiDung = ?`;
    await query(sql, params);
    const rows = await query('SELECT ID_NguoiDung, HoTen, Email, SoDienThoai, DiaChi, Role FROM NguoiDung WHERE ID_NguoiDung = ?', [req.user.ID_NguoiDung]);
    res.json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// admin
router.get('/', authenticate, isAdmin, async (req, res) => {
  const includePassword = req.query.includePassword === '1';
  const cols = includePassword ? '*' : 'ID_NguoiDung, HoTen, Email, SoDienThoai, DiaChi, Role';
  const users = await query(`SELECT ${cols} FROM NguoiDung`);
  res.json(users);
});

// create user (admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  const { HoTen, Email, SoDienThoai, DiaChi, Password, Role } = req.body;
  try {
    const hash = Password ? await bcrypt.hash(Password, 10) : '!';
    const r = await query('INSERT INTO NguoiDung (HoTen, Email, SoDienThoai, DiaChi, Password, Role) VALUES (?, ?, ?, ?, ?, ?)', [HoTen, Email, SoDienThoai || null, DiaChi || null, hash, Role || 'user']);
    const id = r.insertId;
    const rows = await query('SELECT ID_NguoiDung, HoTen, Email, SoDienThoai, DiaChi, Role FROM NguoiDung WHERE ID_NguoiDung = ?', [id]);
    res.json(rows[0]);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// update user by id (admin)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const rows = await query('SELECT * FROM NguoiDung WHERE ID_NguoiDung = ?', [id]);
  if (!rows || rows.length === 0) return res.status(404).json({ message: 'Not found' });
  const data = { ...req.body };
  try {
    if (data.Password) { data.Password = await bcrypt.hash(data.Password, 10); }
    const updates = [];
    const params = [];
    const fields = ['HoTen', 'Email', 'SoDienThoai', 'DiaChi', 'Password', 'Role'];
    for (const f of fields) {
      if (data[f] !== undefined) { updates.push(`${f} = ?`); params.push(data[f]); }
    }
    if (updates.length === 0) return res.json({});
    params.push(id);
    await query(`UPDATE NguoiDung SET ${updates.join(', ')} WHERE ID_NguoiDung = ?`, params);
    const out = await query('SELECT ID_NguoiDung, HoTen, Email, SoDienThoai, DiaChi, Role FROM NguoiDung WHERE ID_NguoiDung = ?', [id]);
    res.json(out[0]);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const rows = await query('SELECT * FROM NguoiDung WHERE ID_NguoiDung = ?', [id]);
  if (!rows || rows.length === 0) return res.status(404).json({ message: 'Not found' });
  try {
    await query('DELETE FROM NguoiDung WHERE ID_NguoiDung = ?', [id]);
    return res.json({ message: 'Deleted' });
  } catch (err) {
    if (err && err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ error: 'Không thể xóa người dùng vì có tham chiếu (ví dụ: phiếu mượn). Vui lòng xóa dữ liệu liên quan trước hoặc đánh dấu vô hiệu người dùng.' });
    }
    console.error('Error deleting user:', err);
    return res.status(500).json({ error: err.message || 'Lỗi server' });
  }
});

module.exports = router;
