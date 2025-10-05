const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Helpers
async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}
async function transaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const r = await fn(conn);
    await conn.commit();
    return r;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// lightweight auth helpers (adjust to real auth if you have JWT/session)
function authenticate(req, res, next) {
  const id = req.header('x-user-id');
  if (id) {
    req.user = { ID_NguoiDung: Number(id), Role: req.header('x-user-role') || 'user' };
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}
function isAdmin(req, res, next) {
  if (req.user && req.user.Role === 'admin') return next();
  return res.status(403).json({ error: 'Forbidden' });
}

// convert various inputs to SQL DATE 'YYYY-MM-DD'
function toSQLDate(input) {
  const d = input ? new Date(input) : new Date();
  if (Number.isNaN(d.getTime())) throw new Error('Invalid date');
  return d.toISOString().slice(0, 10);
}

// read a borrow with its items
async function getBorrowById(id) {
  const rowsP = await query('SELECT ID_PhieuMuon, ID_NguoiDung, NgayMuon, HanTra, TrangThai FROM PhieuMuon WHERE ID_PhieuMuon = ?', [id]);
  if (!rowsP || rowsP.length === 0) return null;
  const rowsC = await query(
    'SELECT c.ID_PhieuMuon, c.ID_Sach, s.TieuDeSach FROM ChiTietPhieuMuon c JOIN Sach s ON c.ID_Sach = s.ID_Sach WHERE c.ID_PhieuMuon = ?',
    [id]
  );
  return { ...rowsP[0], items: rowsC };
}

// POST /create
// payload: { ID_NguoiDung?, NgayMuon?, HanTra?, items: [{ID_Sach}, ...] }
// Behavior:
// - Determine userId: req.user.ID_NguoiDung (if set) else body.ID_NguoiDung
// - Normalize dates to DATE
// - Pre-check availability (book not in active borrow AND SoLuongCon > 0)
// - Create PhieuMuon and ChiTietPhieuMuon only for available items within a transaction
// - Decrement SoLuongCon for inserted books
// - Return { borrow, skipped } where skipped is array of unavailable IDs (if any)
router.post('/create', async (req, res) => {
  const { ID_NguoiDung = null, NgayMuon, HanTra, items = [] } = req.body;
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Không có sách để mượn' });

  let sqlNgay, sqlHan;
  try {
    sqlNgay = toSQLDate(NgayMuon);
    sqlHan = toSQLDate(HanTra);
  } catch (err) {
    return res.status(400).json({ error: 'Ngày không hợp lệ' });
  }

  // determine user id (prefer authenticated)
  const userId = (req.user && req.user.ID_NguoiDung) ? req.user.ID_NguoiDung : (ID_NguoiDung ?? null);

  const ids = items.map(it => Number(it.ID_Sach)).filter(Boolean);
  try {
    // pre-check busy (already in active borrow) OR out-of-stock
    let busyIds = [];
    if (ids.length > 0) {
      const busyRows = await query(
        'SELECT DISTINCT c.ID_Sach FROM ChiTietPhieuMuon c JOIN PhieuMuon p ON c.ID_PhieuMuon = p.ID_PhieuMuon WHERE c.ID_Sach IN (?) AND p.TrangThai NOT IN (?, ?)',
        [ids, 'Đã trả', 'returned']
      );
      busyIds = busyRows.map(r => r.ID_Sach);

      // check SoLuongCon = 0 as unavailable
      const zeroRows = await query('SELECT ID_Sach FROM Sach WHERE ID_Sach IN (?) AND SoLuongCon <= 0', [ids]);
      const zeroIds = zeroRows.map(r => r.ID_Sach);
      busyIds = Array.from(new Set([...busyIds, ...zeroIds]));
    }

    const availableItems = items.filter(it => !busyIds.includes(it.ID_Sach));
    if (availableItems.length === 0) {
      return res.status(400).json({ error: 'Không có sách khả dụng để mượn', skipped: busyIds });
    }

    const pid = await transaction(async (conn) => {
      const [r] = await conn.query('INSERT INTO PhieuMuon (ID_NguoiDung, NgayMuon, HanTra, TrangThai) VALUES (?,?,?,?)', [userId, sqlNgay, sqlHan, 'Đang mượn']);
      const idPhieu = r.insertId;
      const values = availableItems.map(it => [idPhieu, it.ID_Sach]);

      // insert chi tiết
      await conn.query('INSERT INTO ChiTietPhieuMuon (ID_PhieuMuon, ID_Sach) VALUES ?', [values]);

      // decrement stock
      for (const it of availableItems) {
        await conn.query('UPDATE Sach SET SoLuongCon = SoLuongCon - 1 WHERE ID_Sach = ? AND SoLuongCon > 0', [it.ID_Sach]);
      }

      return idPhieu;
    });

    const borrow = await getBorrowById(pid);
    return res.status(201).json({ borrow, skipped: busyIds.length ? busyIds : undefined });
  } catch (err) {
    console.error('[borrows/create] error:', err);
    const msg = err.sqlMessage || err.message || 'Lỗi khi tạo phiếu mượn';
    return res.status(400).json({ error: msg });
  }
});

// GET / (user borrows)
router.get('/', authenticate, async (req, res) => {
  try {
    const rows = await query('SELECT ID_PhieuMuon FROM PhieuMuon WHERE ID_NguoiDung = ?', [req.user.ID_NguoiDung]);
    const out = [];
    for (const r of rows) {
      const p = await getBorrowById(r.ID_PhieuMuon);
      out.push(p);
    }
    res.json(out);
  } catch (err) {
    console.error('[borrows/list] error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /all (admin)
router.get('/all', authenticate, isAdmin, async (req, res) => {
  try {
    const rows = await query('SELECT ID_PhieuMuon FROM PhieuMuon');
    const out = [];
    for (const r of rows) {
      const p = await getBorrowById(r.ID_PhieuMuon);
      out.push(p);
    }
    res.json(out);
  } catch (err) {
    console.error('[borrows/all] error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const borrow = await getBorrowById(req.params.id);
    if (!borrow) return res.status(404).json({ error: 'Phiếu mượn không tìm thấy' });
    if (borrow.ID_NguoiDung && borrow.ID_NguoiDung !== req.user.ID_NguoiDung && req.user.Role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(borrow);
  } catch (err) {
    console.error('[borrows/get] error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/return - mark returned, increment stock
router.post('/:id/return', authenticate, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const pid = await transaction(async (conn) => {
      const [ph] = await conn.query('SELECT * FROM PhieuMuon WHERE ID_PhieuMuon = ? FOR UPDATE', [id]);
      const borrow = ph[0];
      if (!borrow) throw new Error('Not found');
      if (borrow.ID_NguoiDung !== req.user.ID_NguoiDung && req.user.Role !== 'admin') throw new Error('Forbidden');

      const [details] = await conn.query('SELECT * FROM ChiTietPhieuMuon WHERE ID_PhieuMuon = ? FOR UPDATE', [id]);
      for (const d of details) {
        await conn.query('UPDATE Sach SET SoLuongCon = SoLuongCon + 1 WHERE ID_Sach = ?', [d.ID_Sach]);
        // ChiTietPhieuMuon columns NgayTraThucTe/TinhTrangSach may not exist - skip updating them
      }
      await conn.query('UPDATE PhieuMuon SET TrangThai = ? WHERE ID_PhieuMuon = ?', ['returned', id]);
      return id;
    });
    const fresh = await getBorrowById(pid);
    res.json(fresh);
  } catch (err) {
    if (err.message === 'Forbidden') return res.status(403).json({ message: 'Forbidden' });
    console.error('[borrows/return] error:', err);
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
