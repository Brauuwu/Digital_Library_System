const express = require('express');
const { Book, Publisher, Author, Category } = require('../models');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

// list & search
router.get('/', async (req,res)=>{
  const q = req.query.q || '';
  const where = q ? { TieuDeSach: { [require('sequelize').Op.like]: `%${q}%` } } : {};
  const books = await Book.findAll({ where, include: [Publisher, Author, Category] });
  // normalize authors/categories for frontend
  const out = books.map(b=>{
    const jb = b.toJSON();
    jb.Authors = (jb.TacGias || jb.Authors || jb.TacGia || jb.Author || []).map(a=> ({ ID_TacGia: a.ID_TacGia || a.ID || a.id, HoTen: a.TenTacGia || a.HoTen || a.name }));
    jb.Categories = (jb.TheLoais || jb.Categories || jb.TheLoai || []).map(c=> ({ ID_TheLoai: c.ID_TheLoai || c.ID || c.id, TenTheLoai: c.TenTheLoai || c.name }));
    return jb;
  });
  res.json(out);
});

router.get('/:id', async (req,res)=>{
  const book = await Book.findByPk(req.params.id, { include: [Publisher, Author, Category] });
  if(!book) return res.status(404).json({ message: 'Not found' });
  const jb = book.toJSON();
  jb.Authors = (jb.TacGias || jb.Authors || jb.TacGia || jb.Author || []).map(a=> ({ ID_TacGia: a.ID_TacGia || a.ID || a.id, HoTen: a.TenTacGia || a.HoTen || a.name }));
  jb.Categories = (jb.TheLoais || jb.Categories || jb.TheLoai || []).map(c=> ({ ID_TheLoai: c.ID_TheLoai || c.ID || c.id, TenTheLoai: c.TenTheLoai || c.name }));
  res.json(jb);
});

router.post('/', authenticate, isAdmin, async (req,res)=>{
  const data = req.body;
  try{
    const { authorIds, categoryIds, ...rest } = data;
    // validate numeric fields explicitly
    if(rest.SoLuongCon !== undefined){
      const n = Number(rest.SoLuongCon);
      if(!Number.isInteger(n) || n < 0) return res.status(400).json({ error: 'SoLuongCon must be a non-negative integer' });
      rest.SoLuongCon = n;
    }
    const book = await Book.create(rest);
    // helper to set associations using Sequelize-generated accessors
    const setAssoc = async (instance, Model, ids)=>{
      if(!Array.isArray(ids)) return;
      const associations = instance.constructor && instance.constructor.associations ? instance.constructor.associations : {};
      const assoc = Object.values(associations).find(a=> a.target && a.target.name === Model.name);
      if(!assoc) return;
      const setter = assoc.accessors && assoc.accessors.set;
      if(setter && typeof instance[setter] === 'function'){
        await instance[setter](ids);
      }
    };
    await setAssoc(book, Author, authorIds || []);
    await setAssoc(book, Category, categoryIds || []);
    const fresh = await Book.findByPk(book.ID_Sach, { include: [Publisher, Author, Category] });
    const jb = fresh.toJSON();
    jb.Authors = (jb.TacGias || jb.Authors || []).map(a=> ({ ID_TacGia: a.ID_TacGia || a.ID, HoTen: a.TenTacGia || a.HoTen }));
    jb.Categories = (jb.TheLoais || jb.Categories || []).map(c=> ({ ID_TheLoai: c.ID_TheLoai || c.ID, TenTheLoai: c.TenTheLoai || c.Ten }));
    res.json(jb);
  }catch(err){
    if(err && err.name === 'SequelizeValidationError'){
      return res.status(400).json({ error: err.errors.map(e=>e.message).join('; ') });
    }
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', authenticate, isAdmin, async (req,res)=>{
  const book = await Book.findByPk(req.params.id);
  if(!book) return res.status(404).json({ message: 'Not found' });
  try{
    const { authorIds, categoryIds, ...rest } = req.body;
    // validate numeric input explicitly
    if(rest.SoLuongCon !== undefined){
      const n = Number(rest.SoLuongCon);
      if(!Number.isInteger(n) || n < 0) return res.status(400).json({ error: 'SoLuongCon must be a non-negative integer' });
      rest.SoLuongCon = n;
    }
    await book.update(rest);
    const setAssoc = async (instance, Model, ids)=>{
      if(!Array.isArray(ids)) return;
      const associations = instance.constructor && instance.constructor.associations ? instance.constructor.associations : {};
      const assoc = Object.values(associations).find(a=> a.target && a.target.name === Model.name);
      if(!assoc) return;
      const setter = assoc.accessors && assoc.accessors.set;
      if(setter && typeof instance[setter] === 'function'){
        await instance[setter](ids);
      }
    };
    await setAssoc(book, Author, authorIds || []);
    await setAssoc(book, Category, categoryIds || []);
    const fresh = await Book.findByPk(book.ID_Sach, { include: [Publisher, Author, Category] });
    const jb = fresh.toJSON();
    jb.Authors = (jb.TacGias || jb.Authors || []).map(a=> ({ ID_TacGia: a.ID_TacGia || a.ID, HoTen: a.TenTacGia || a.HoTen }));
    jb.Categories = (jb.TheLoais || jb.Categories || []).map(c=> ({ ID_TheLoai: c.ID_TheLoai || c.ID, TenTheLoai: c.TenTheLoai || c.Ten }));
    res.json(jb);
  }catch(err){
    if(err && err.name === 'SequelizeValidationError'){
      return res.status(400).json({ error: err.errors.map(e=>e.message).join('; ') });
    }
    if(err && err.name === 'SequelizeUniqueConstraintError'){
      return res.status(400).json({ error: err.errors.map(e=>e.message).join('; ') });
    }
    res.status(400).json({ error: err.message }); }
});

router.delete('/:id', authenticate, isAdmin, async (req,res)=>{
  const book = await Book.findByPk(req.params.id);
  if(!book) return res.status(404).json({ message: 'Not found' });
  await book.destroy();
  res.json({ message: 'Deleted' });
});

module.exports = router;
