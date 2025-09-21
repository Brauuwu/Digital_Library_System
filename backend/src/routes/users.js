const express = require('express');
const { User } = require('../models');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

const bcrypt = require('bcrypt');

router.get('/me', authenticate, async (req,res)=>{
  res.json({ ID_NguoiDung: req.user.ID_NguoiDung, HoTen: req.user.HoTen, Email: req.user.Email, SoDienThoai: req.user.SoDienThoai, DiaChi: req.user.DiaChi, Role: req.user.Role });
});

router.put('/me', authenticate, async (req,res)=>{
  await req.user.update(req.body);
  res.json(req.user);
});

// admin
router.get('/', authenticate, isAdmin, async (req,res)=>{
  const users = await User.findAll();
  res.json(users);
});

// create user (admin only)
router.post('/', authenticate, isAdmin, async (req,res)=>{
  const { HoTen, Email, SoDienThoai, DiaChi, Password, Role } = req.body;
  try{
    const hash = Password ? await bcrypt.hash(Password, 10) : undefined;
    const user = await User.create({ HoTen, Email, SoDienThoai, DiaChi, Password: hash || '!', Role });
    // don't return password
    const u = { ID_NguoiDung: user.ID_NguoiDung, HoTen: user.HoTen, Email: user.Email, SoDienThoai: user.SoDienThoai, DiaChi: user.DiaChi, Role: user.Role };
    res.json(u);
  }catch(err){ res.status(400).json({ error: err.message }); }
});

// update user by id (admin)
router.put('/:id', authenticate, isAdmin, async (req,res)=>{
  const u = await User.findByPk(req.params.id);
  if(!u) return res.status(404).json({ message: 'Not found' });
  const data = { ...req.body };
  try{
    if(data.Password){ data.Password = await bcrypt.hash(data.Password, 10); }
    await u.update(data);
    const out = { ID_NguoiDung: u.ID_NguoiDung, HoTen: u.HoTen, Email: u.Email, SoDienThoai: u.SoDienThoai, DiaChi: u.DiaChi, Role: u.Role };
    res.json(out);
  }catch(err){ res.status(400).json({ error: err.message }); }
});

router.delete('/:id', authenticate, isAdmin, async (req,res)=>{
  const u = await User.findByPk(req.params.id);
  if(!u) return res.status(404).json({ message: 'Not found' });
  await u.destroy();
  res.json({ message: 'Deleted' });
});

module.exports = router;
