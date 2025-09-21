const express = require('express');
const { Category, Book } = require('../models');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req,res)=>{
  // include with alias to match model association
  const cats = await Category.findAll({ include: [{ model: Book, as: 'Saches' }] });
  // normalize books inside category
  const out = cats.map(c=>{
    const jc = c.toJSON();
    const rawBooks = jc.Saches || jc.Books || jc.Sach || [];
    jc.Books = rawBooks.map(b=> ({ ID_Sach: b.ID_Sach || b.ID || b.id, TieuDeSach: b.TieuDeSach || b.TieuDeSach, ISBN: b.ISBN, SoLuongCon: b.SoLuongCon }));
    return { ID_TheLoai: jc.ID_TheLoai, TenTheLoai: jc.TenTheLoai, Books: jc.Books };
  });
  res.json(out);
});

router.post('/', authenticate, isAdmin, async (req,res)=>{
  try{ const c = await Category.create(req.body); res.json(c); }catch(err){ res.status(400).json({error: err.message}); }
});

router.put('/:id', authenticate, isAdmin, async (req,res)=>{
  const c = await Category.findByPk(req.params.id);
  if(!c) return res.status(404).json({ message: 'Not found' });
  await c.update(req.body);
  res.json(c);
});

router.delete('/:id', authenticate, isAdmin, async (req,res)=>{
  const c = await Category.findByPk(req.params.id);
  if(!c) return res.status(404).json({ message: 'Not found' });
  await c.destroy();
  res.json({ message: 'Deleted' });
});

module.exports = router;
