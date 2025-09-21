const express = require('express');
const { Publisher } = require('../models');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req,res)=>{ const p = await Publisher.findAll(); res.json(p); });
router.post('/', authenticate, isAdmin, async (req,res)=>{ const p = await Publisher.create(req.body); res.json(p); });

module.exports = router;
