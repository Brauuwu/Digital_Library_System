const express = require('express');
const { authenticate, isAdmin } = require('../middleware/auth');
const { query, transaction } = require('../db');
const router = express.Router();

// GET list
router.get('/', async (req, res) => {
  try {
    const qparam = req.query.q || '';
    const q = qparam ? `%${qparam}%` : '%';
    const booksSql = `
      SELECT s.ID_Sach, s.TieuDeSach, s.ISBN, s.NamXuatBan, s.SoLuongCon,
             n.ID_NXB, n.TenNXB, n.DiaChi AS NXB_DiaChi, n.Website AS NXB_Website
      FROM Sach s
      LEFT JOIN NhaXuatBan n ON s.ID_NXB = n.ID_NXB
      WHERE s.TieuDeSach LIKE ?
      ORDER BY s.ID_Sach DESC
      LIMIT 100
    `;
    const books = await query(booksSql, [q]);
    if (!books || books.length === 0) return res.json([]);
    const ids = books.map(b => b.ID_Sach);
    const inPlaceholders = ids.map(() => '?').join(',');
    const authorsSql = `SELECT ts.ID_Sach, tg.ID_TacGia, tg.TenTacGia FROM TacGia_Sach ts JOIN TacGia tg ON ts.ID_TacGia = tg.ID_TacGia WHERE ts.ID_Sach IN (${inPlaceholders})`;
    const authors = await query(authorsSql, ids);
    const catsSql = `SELECT tl.ID_Sach, t.ID_TheLoai, t.TenTheLoai FROM TheLoai_Sach tl JOIN TheLoai t ON tl.ID_TheLoai = t.ID_TheLoai WHERE tl.ID_Sach IN (${inPlaceholders})`;
    const categories = await query(catsSql, ids);

    const authorsByBook = {};
    for (const a of authors) {
      if (!authorsByBook[a.ID_Sach]) authorsByBook[a.ID_Sach] = [];
      authorsByBook[a.ID_Sach].push({ ID_TacGia: a.ID_TacGia, HoTen: a.TenTacGia });
    }
    const catsByBook = {};
    for (const c of categories) {
      if (!catsByBook[c.ID_Sach]) catsByBook[c.ID_Sach] = [];
      catsByBook[c.ID_Sach].push({ ID_TheLoai: c.ID_TheLoai, TenTheLoai: c.TenTheLoai });
    }

    const out = books.map(b => ({
      ID_Sach: b.ID_Sach,
      TieuDeSach: b.TieuDeSach,
      ISBN: b.ISBN,
      NamXuatBan: b.NamXuatBan,
      SoLuongCon: b.SoLuongCon,
      Publisher: b.ID_NXB ? { ID_NXB: b.ID_NXB, TenNXB: b.TenNXB, DiaChi: b.NXB_DiaChi, Website: b.NXB_Website } : null,
      Authors: authorsByBook[b.ID_Sach] || [],
      Categories: catsByBook[b.ID_Sach] || [],
    }));
    res.json(out);
  } catch (err) {
    console.error('books list error', err);
    res.status(500).json({ error: err.message });
  }
});

// GET detail
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const bookSql = `SELECT s.*, n.ID_NXB, n.TenNXB, n.DiaChi AS NXB_DiaChi, n.Website AS NXB_Website FROM Sach s LEFT JOIN NhaXuatBan n ON s.ID_NXB = n.ID_NXB WHERE s.ID_Sach = ?`;
    const rows = await query(bookSql, [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Not found' });
    const b = rows[0];
    const authors = await query(`SELECT tg.ID_TacGia, tg.TenTacGia FROM TacGia_Sach ts JOIN TacGia tg ON ts.ID_TacGia = tg.ID_TacGia WHERE ts.ID_Sach = ?`, [id]);
    const categories = await query(`SELECT t.ID_TheLoai, t.TenTheLoai FROM TheLoai_Sach tl JOIN TheLoai t ON tl.ID_TheLoai = t.ID_TheLoai WHERE tl.ID_Sach = ?`, [id]);
    const out = {
      ID_Sach: b.ID_Sach,
      TieuDeSach: b.TieuDeSach,
      ISBN: b.ISBN,
      NamXuatBan: b.NamXuatBan,
      SoLuongCon: b.SoLuongCon,
      Publisher: b.ID_NXB ? { ID_NXB: b.ID_NXB, TenNXB: b.TenNXB, DiaChi: b.NXB_DiaChi, Website: b.NXB_Website } : null,
      Authors: authors.map(a => ({ ID_TacGia: a.ID_TacGia, HoTen: a.TenTacGia })),
      Categories: categories.map(c => ({ ID_TheLoai: c.ID_TheLoai, TenTheLoai: c.TenTheLoai })),
    };
    res.json(out);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST create (admin)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { authorIds = [], categoryIds = [], ...rest } = req.body;
    if (rest.SoLuongCon !== undefined) {
      const n = Number(rest.SoLuongCon);
      if (!Number.isInteger(n) || n < 0) return res.status(400).json({ error: 'SoLuongCon must be a non-negative integer' });
      rest.SoLuongCon = n;
    }
    const newId = await transaction(async (conn) => {
      const insertSql = `INSERT INTO Sach (ID_NXB, ISBN, TieuDeSach, NamXuatBan, SoLuongCon) VALUES (?, ?, ?, ?, ?)`;
      const [r] = await conn.execute(insertSql, [rest.ID_NXB || null, rest.ISBN || null, rest.TieuDeSach, rest.NamXuatBan || null, rest.SoLuongCon || 0]);
      const nid = r.insertId;
      if (Array.isArray(authorIds) && authorIds.length) {
        const vals = authorIds.map(a => [a, nid]);
        const placeholders = vals.map(() => '(?,?)').join(',');
        await conn.execute(`INSERT INTO TacGia_Sach (ID_TacGia, ID_Sach) VALUES ${placeholders}`, vals.flat());
      }
      if (Array.isArray(categoryIds) && categoryIds.length) {
        const vals = categoryIds.map(c => [c, nid]);
        const placeholders = vals.map(() => '(?,?)').join(',');
        await conn.execute(`INSERT INTO TheLoai_Sach (ID_TheLoai, ID_Sach) VALUES ${placeholders}`, vals.flat());
      }
      return nid;
    });
    const fresh = await query('SELECT * FROM Sach WHERE ID_Sach = ?', [newId]);
    res.json(fresh[0]);
  } catch (err) {
    console.error('create book error', err);
    res.status(400).json({ error: err.message });
  }
});

// PUT update (admin)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = await query('SELECT * FROM Sach WHERE ID_Sach = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Not found' });
    const { authorIds, categoryIds, ...rest } = req.body;
    if (rest.SoLuongCon !== undefined) {
      const n = Number(rest.SoLuongCon);
      if (!Number.isInteger(n) || n < 0) return res.status(400).json({ error: 'SoLuongCon must be a non-negative integer' });
      rest.SoLuongCon = n;
    }
    await transaction(async (conn) => {
      const updates = [];
      const params = [];
      const fields = ['ID_NXB','ISBN','TieuDeSach','NamXuatBan','SoLuongCon'];
      for (const f of fields) {
        if (rest[f] !== undefined) { updates.push(`${f} = ?`); params.push(rest[f]); }
      }
      if (updates.length) {
        params.push(id);
        await conn.execute(`UPDATE Sach SET ${updates.join(', ')} WHERE ID_Sach = ?`, params);
      }
      if (Array.isArray(authorIds)) {
        await conn.execute('DELETE FROM TacGia_Sach WHERE ID_Sach = ?', [id]);
        if (authorIds.length) {
          const vals = authorIds.map(a => [a, id]);
          const placeholders = vals.map(() => '(?,?)').join(',');
          await conn.execute(`INSERT INTO TacGia_Sach (ID_TacGia, ID_Sach) VALUES ${placeholders}`, vals.flat());
        }
      }
      if (Array.isArray(categoryIds)) {
        await conn.execute('DELETE FROM TheLoai_Sach WHERE ID_Sach = ?', [id]);
        if (categoryIds.length) {
          const vals = categoryIds.map(c => [c, id]);
          const placeholders = vals.map(() => '(?,?)').join(',');
          await conn.execute(`INSERT INTO TheLoai_Sach (ID_TheLoai, ID_Sach) VALUES ${placeholders}`, vals.flat());
        }
      }
    });
    const fresh = await query('SELECT * FROM Sach WHERE ID_Sach = ?', [id]);
    res.json(fresh[0]);
  } catch (err) { console.error('update book error', err); res.status(400).json({ error: err.message }); }
});

// DELETE (admin)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = await query('SELECT * FROM Sach WHERE ID_Sach = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Not found' });
    await transaction(async (conn) => {
      await conn.execute('DELETE FROM TacGia_Sach WHERE ID_Sach = ?', [id]);
      await conn.execute('DELETE FROM TheLoai_Sach WHERE ID_Sach = ?', [id]);
      await conn.execute('DELETE FROM Sach WHERE ID_Sach = ?', [id]);
    });
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('delete book error', err); res.status(400).json({ error: err.message }); }
});

module.exports = router;
