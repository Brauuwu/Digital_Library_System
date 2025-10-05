const express = require('express');
const { query } = require('../db');
const router = express.Router();

// List authors, support ?q=search
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (q) {
      const rows = await query('SELECT ID_TacGia, TenTacGia FROM TacGia WHERE TenTacGia LIKE ? LIMIT 200', [`%${q}%`]);
      return res.json(rows.map(r => ({ ID_TacGia: r.ID_TacGia, HoTen: r.TenTacGia })));
    }
    const rows = await query('SELECT ID_TacGia, TenTacGia FROM TacGia LIMIT 200');
    res.json(rows.map(r => ({ ID_TacGia: r.ID_TacGia, HoTen: r.TenTacGia })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get author detail + their books
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = await query('SELECT * FROM TacGia WHERE ID_TacGia = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Not found' });
    const a = rows[0];
    const books = await query(`SELECT s.ID_Sach, s.TieuDeSach FROM TacGia_Sach ts JOIN Sach s ON ts.ID_Sach = s.ID_Sach WHERE ts.ID_TacGia = ?`, [id]);
    res.json({ ID_TacGia: a.ID_TacGia, HoTen: a.TenTacGia, TieuSu: a.TieuSu || '', Books: books.map(b => ({ ID_Sach: b.ID_Sach, TieuDeSach: b.TieuDeSach })) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
