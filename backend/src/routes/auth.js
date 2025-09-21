const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { HoTen, Email, SoDienThoai, DiaChi, Password } = req.body;
  try{
    const hash = await bcrypt.hash(Password, 10);
    const user = await User.create({ HoTen, Email, SoDienThoai, DiaChi, Password: hash });
    res.json({ user });
  }catch(err){
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { Email, Password } = req.body;
  try{
    const user = await User.findOne({ where: { Email } });
    if(!user) return res.status(400).json({ message: 'Invalid creds' });
    const ok = await bcrypt.compare(Password, user.Password);
    if(!ok) return res.status(400).json({ message: 'Invalid creds' });
    const token = jwt.sign({ id: user.ID_NguoiDung }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { ID_NguoiDung: user.ID_NguoiDung, HoTen: user.HoTen, Email: user.Email, Role: user.Role } });
  }catch(err){
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
