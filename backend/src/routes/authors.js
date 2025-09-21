const express = require('express');
const { Author } = require('../models');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req,res)=>{ const a = await Author.findAll(); res.json(a); });
router.post('/', authenticate, isAdmin, async (req,res)=>{ const a = await Author.create(req.body); res.json(a); });

module.exports = router;
