const express = require("express");
const { query } = require("../db");

const router = express.Router();

// Lấy danh sách thể loại + sách của từng thể loại
router.get("/", async (req, res) => {
  try {
    const cats = await query("SELECT ID_TheLoai, TenTheLoai FROM TheLoai");
    const out = [];
    for (const c of cats) {
      const books = await query(
        "SELECT s.ID_Sach, s.TieuDeSach, s.ISBN, s.SoLuongCon FROM TheLoai_Sach tl JOIN Sach s ON tl.ID_Sach = s.ID_Sach WHERE tl.ID_TheLoai = ?",
        [c.ID_TheLoai]
      );
      out.push({ ID_TheLoai: c.ID_TheLoai, TenTheLoai: c.TenTheLoai, Books: books });
    }
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
