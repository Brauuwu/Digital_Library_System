const express = require('express');
const { query } = require('../db');
const router = express.Router();


// Lấy danh sách nhà xuất bản
router.get('/', async (req, res) => {
  try {
    const pubs = await query('SELECT ID_NXB, TenNXB, DiaChi, Website FROM NhaXuatBan');
    res.json(pubs);
  } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

// Lấy chi tiết nhà xuất bản theo id (kèm danh sách sách)
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = await query('SELECT ID_NXB, TenNXB, DiaChi, Website FROM NhaXuatBan WHERE ID_NXB = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy nhà xuất bản' });
    const pub = rows[0];
    const books = await query('SELECT ID_Sach, TieuDeSach, ISBN, SoLuongCon FROM Sach WHERE ID_NXB = ?', [id]);
    pub.Books = books;
    res.json(pub);
  } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});


module.exports = router;
