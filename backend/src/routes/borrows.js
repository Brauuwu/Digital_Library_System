const express = require('express');
const { Borrow, BorrowDetail, Book, sequelize, User } = require('../models');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

// create a borrow record (user borrows multiple books) - transactional and checks availability
router.post('/', authenticate, async (req,res)=>{
  const { NgayMuon, HanTra, items } = req.body;
  if(!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'No items' });
  const t = await sequelize.transaction();
  try{
    // check availability
    for(const it of items){
      const book = await Book.findByPk(it.ID_Sach, { transaction: t, lock: t.LOCK.UPDATE });
      if(!book) throw new Error(`Book ${it.ID_Sach} not found`);
      if((book.SoLuongCon || 0) <= 0) throw new Error(`Book ${book.TieuDeSach} is not available`);
    }
    const borrow = await Borrow.create({ ID_NguoiDung: req.user.ID_NguoiDung, NgayMuon, HanTra, TrangThai: 'borrowed' }, { transaction: t });
    for(const it of items){
      await BorrowDetail.create({ ID_PhieuMuon: borrow.ID_PhieuMuon, ID_Sach: it.ID_Sach }, { transaction: t });
      const b = await Book.findByPk(it.ID_Sach, { transaction: t, lock: t.LOCK.UPDATE });
      b.SoLuongCon = Math.max(0, b.SoLuongCon - 1);
      await b.save({ transaction: t });
    }
    await t.commit();
    res.json(borrow);
  }catch(err){
    await t.rollback();
    res.status(400).json({ error: err.message });
  }
});

// user can view their borrows
router.get('/', authenticate, async (req,res)=>{
  const borrows = await Borrow.findAll({ where: { ID_NguoiDung: req.user.ID_NguoiDung }, include: [ { model: BorrowDetail, include: [Book] } ] });
  res.json(borrows);
});

// admin: list all borrows
router.get('/all', authenticate, isAdmin, async (req,res)=>{
  const borrows = await Borrow.findAll({ include: [ { model: BorrowDetail, include: [Book] }, { model: User } ] });
  res.json(borrows);
});

// return a book (or mark borrow returned) - admin or owner
router.post('/:id/return', authenticate, async (req,res)=>{
  const t = await sequelize.transaction();
  try{
    const borrow = await Borrow.findByPk(req.params.id, { include: [BorrowDetail], transaction: t, lock: t.LOCK.UPDATE });
    if(!borrow) { await t.rollback(); return res.status(404).json({ message: 'Not found' }); }
    if(borrow.ID_NguoiDung !== req.user.ID_NguoiDung && req.user.Role !== 'admin') { await t.rollback(); return res.status(403).json({ message: 'Forbidden' }); }
    const details = await BorrowDetail.findAll({ where: { ID_PhieuMuon: borrow.ID_PhieuMuon }, transaction: t, lock: t.LOCK.UPDATE });
    for(const detail of details){
      const book = await Book.findByPk(detail.ID_Sach, { transaction: t, lock: t.LOCK.UPDATE });
      if(book){ book.SoLuongCon = (book.SoLuongCon || 0) + 1; await book.save({ transaction: t }); }
      await detail.update({ NgayTraThucTe: new Date(), TinhTrangSach: req.body.TinhTrangSach || 'good' }, { transaction: t });
    }
    await borrow.update({ TrangThai: 'returned' }, { transaction: t });
    await t.commit();
    res.json({ message: 'Returned' });
  }catch(err){ await t.rollback(); res.status(400).json({ error: err.message }); }
});

module.exports = router;
