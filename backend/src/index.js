// backend/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');

// Routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/users');
const authorRoutes = require('./routes/authors');
const publisherRoutes = require('./routes/publishers');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/publishers', publisherRoutes);

// --- Borrow routes implemented inline ---
const borrowRouter = express.Router();

// helpers
async function q(sql, params = []) { const [rows] = await pool.query(sql, params); return rows; }
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
function toSQLDate(input) {
  const d = input ? new Date(input) : new Date();
  if (Number.isNaN(d.getTime())) throw new Error('Invalid date');
  return d.toISOString().slice(0,10);
}
function authenticateHeader(req, res, next) {
  // try x-user-id first
  let id = req.header('x-user-id');
  let role = req.header('x-user-role');
  // fallback to Authorization: Bearer <id> or "User <id>"
  if (!id) {
    const auth = req.header('authorization') || req.header('Authorization') || '';
    if (auth) {
      const parts = auth.split(/\s+/);
      if (parts.length >= 2) {
        // Bearer 5  OR User 5
        const maybeId = Number(parts[1]);
        if (!Number.isNaN(maybeId)) id = maybeId;
        // if role provided like "Role:admin" in header value, try parse (rare)
        if (parts[0].toLowerCase() === 'role:' && parts[1]) role = parts[1];
      } else {
        const maybeId = Number(auth);
        if (!Number.isNaN(maybeId)) id = maybeId;
      }
    }
  }
  // fallback to query params (useful for quick frontend fixes)
  if (!id && req.query && req.query.userId) id = Number(req.query.userId);
  if (!role && req.query && req.query.userRole) role = req.query.userRole;

  if (id) {
    req.user = { ID_NguoiDung: Number(id), Role: role || 'user' };
    return next();
  }
  console.debug('[auth] missing user identification (no x-user-id / Authorization / query.userId)');
  return res.status(401).json({ error: 'Unauthorized' });
}

function isAdminHeader(req, res, next) {
  const r = req.user?.Role || req.header('x-user-role') || req.query?.userRole;
  if (r && String(r).toLowerCase() === 'admin') return next();
  return res.status(403).json({ error: 'Forbidden' });
}
async function getBorrowById(id) {
  // fetch phieu muon
  const rowsP = await q('SELECT ID_PhieuMuon, ID_NguoiDung, NgayMuon, HanTra, TrangThai FROM PhieuMuon WHERE ID_PhieuMuon = ?', [id]);
  if (!rowsP || rowsP.length === 0) return null;

  // fetch user info (NguoiDung) if available
  let userObj = null;
  if (rowsP[0].ID_NguoiDung) {
    const users = await q('SELECT ID_NguoiDung, HoTen, Email, SoDienThoai, DiaChi FROM NguoiDung WHERE ID_NguoiDung = ?', [rowsP[0].ID_NguoiDung]);
    userObj = users && users.length ? users[0] : null;
  }

  // fetch chi tiết sách for this phiếu mượn
  const rowsC = await q('SELECT c.ID_PhieuMuon, c.ID_Sach, s.TieuDeSach FROM ChiTietPhieuMuon c JOIN Sach s ON c.ID_Sach = s.ID_Sach WHERE c.ID_PhieuMuon = ?', [id]);

  // return shape with ChiTietPhieuMuon and NguoiDung for frontend compatibility
  return { ...rowsP[0], NguoiDung: userObj, ChiTietPhieuMuon: rowsC };
}

// POST /create
borrowRouter.post('/create', async (req, res) => {
  const { ID_NguoiDung = null, NgayMuon, HanTra, items = [] } = req.body;
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Không có sách để mượn' });
  let sqlNgay, sqlHan;
  try { sqlNgay = toSQLDate(NgayMuon); sqlHan = toSQLDate(HanTra); } catch (e) { return res.status(400).json({ error: 'Ngày không hợp lệ' }); }
  const userId = (req.user && req.user.ID_NguoiDung) ? req.user.ID_NguoiDung : (ID_NguoiDung ?? null);

  const ids = items.map(it => Number(it.ID_Sach)).filter(Boolean);
  // Quick stock check (pre-check) to provide fast feedback
  let preSkipped = [];
  if (ids.length > 0) {
    const stockRows = await q('SELECT ID_Sach, SoLuongCon FROM Sach WHERE ID_Sach IN (?)', [ids]);
    const stockMap = Object.fromEntries(stockRows.map(r => [r.ID_Sach, r.SoLuongCon]));
    for (const id of ids) {
      if (!Object.prototype.hasOwnProperty.call(stockMap, id) || stockMap[id] <= 0) preSkipped.push({ ID_Sach: id, reason: 'out_of_stock' });
    }
  }
  // available candidate items (we'll re-check under FOR UPDATE in transaction)
  const candidateItems = items.filter(it => !preSkipped.find(s => s.ID_Sach === it.ID_Sach));
  if (candidateItems.length === 0) {
    return res.status(400).json({ error: 'Không có sách khả dụng để mượn', skipped: preSkipped });
  }

  try {
    // within transaction: lock stocks, confirm availability, create borrow and decrement stock
    const pid = await transaction(async (conn) => {
      // lock requested candidate book rows
      const lockIds = [...new Set(candidateItems.map(it => Number(it.ID_Sach)))];
      const [locked] = await conn.query('SELECT ID_Sach, SoLuongCon FROM Sach WHERE ID_Sach IN (?) FOR UPDATE', [lockIds]);
      const lockedMap = Object.fromEntries(locked.map(r => [r.ID_Sach, r.SoLuongCon]));

      const finalAvailable = [];
      const txnSkipped = [];
      for (const it of candidateItems) {
        const sid = Number(it.ID_Sach);
        if (!Object.prototype.hasOwnProperty.call(lockedMap, sid) || lockedMap[sid] <= 0) {
          txnSkipped.push({ ID_Sach: sid, reason: 'out_of_stock' });
        } else {
          finalAvailable.push(it);
          // decrement in-memory count to account for multiple copies requested in same payload
          lockedMap[sid] = lockedMap[sid] - 1;
        }
      }

      if (finalAvailable.length === 0) {
        // nothing available at txn time
        throw Object.assign(new Error('No available items at commit time'), { code: 'NO_AVAILABLE', skipped: txnSkipped });
      }

      const [r] = await conn.query('INSERT INTO PhieuMuon (ID_NguoiDung, NgayMuon, HanTra, TrangThai) VALUES (?,?,?,?)', [userId, sqlNgay, sqlHan, 'Đang mượn']);
      const idPhieu = r.insertId;
      const values = finalAvailable.map(it => [idPhieu, it.ID_Sach]);
      await conn.query('INSERT INTO ChiTietPhieuMuon (ID_PhieuMuon, ID_Sach) VALUES ?', [values]);
      for (const it of finalAvailable) {
        await conn.query('UPDATE Sach SET SoLuongCon = SoLuongCon - 1 WHERE ID_Sach = ? AND SoLuongCon >= 0', [it.ID_Sach]);
      }
      // return id and any txn-level skipped items
      return { idPhieu, txnSkipped };
    });

    // pid may be object with txnSkipped
    let pidValue, txnSkipped = [];
    if (pid && typeof pid === 'object' && pid.idPhieu) {
      pidValue = pid.idPhieu;
      txnSkipped = pid.txnSkipped || [];
    } else {
      pidValue = pid;
    }
    const borrow = await getBorrowById(pidValue);
    // combine preSkipped and txnSkipped, remove duplicates
    const skippedMap = {};
    for (const s of [...preSkipped, ...txnSkipped]) skippedMap[s.ID_Sach] = s.reason || 'out_of_stock';
    const skipped = Object.keys(skippedMap).map(k => ({ ID_Sach: Number(k), reason: skippedMap[k] }));
    return res.status(201).json({ borrow, skipped: skipped.length ? skipped : undefined });
  } catch (err) {
    console.error('[borrows/create] error:', err);
    if (err && err.code === 'NO_AVAILABLE') {
      return res.status(400).json({ error: 'Không có sách khả dụng để mượn', skipped: err.skipped || preSkipped });
    }
    const msg = err.sqlMessage || err.message || 'Lỗi khi tạo phiếu mượn';
    return res.status(400).json({ error: msg });
  }
});

// GET / (user borrows)
borrowRouter.get('/', authenticateHeader, async (req, res) => {
  try {
    const rows = await q('SELECT ID_PhieuMuon FROM PhieuMuon WHERE ID_NguoiDung = ?', [req.user.ID_NguoiDung]);
    const out = [];
    for (const r of rows) out.push(await getBorrowById(r.ID_PhieuMuon));
    res.json(out);
  } catch (err) { console.error('[borrows/list] error:', err); res.status(500).json({ error: err.message }); }
});

// GET /all (admin)
borrowRouter.get('/all', authenticateHeader, isAdminHeader, async (req, res) => {
  try {
    const rows = await q('SELECT ID_PhieuMuon FROM PhieuMuon');
    const out = [];
    for (const r of rows) out.push(await getBorrowById(r.ID_PhieuMuon));
    res.json(out);
  } catch (err) { console.error('[borrows/all] error:', err); res.status(500).json({ error: err.message }); }
});

// GET /:id
borrowRouter.get('/:id', authenticateHeader, async (req, res) => {
  try {
    const borrow = await getBorrowById(req.params.id);
    if (!borrow) return res.status(404).json({ error: 'Phiếu mượn không tìm thấy' });
    if (borrow.ID_NguoiDung && borrow.ID_NguoiDung !== req.user.ID_NguoiDung && req.user.Role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    res.json(borrow);
  } catch (err) { console.error('[borrows/get] error:', err); res.status(500).json({ error: err.message }); }
});

// POST /:id/return
borrowRouter.post('/:id/return', authenticateHeader, async (req, res) => {
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

app.use('/api/borrows', borrowRouter);
// --- end borrow routes ---

const PORT = process.env.PORT || 4000;

// Start server
async function start() {
  try {
    // test DB connection
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ DB connected successfully (pool)');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Unable to connect to DB:', err);
  }
}

start();
