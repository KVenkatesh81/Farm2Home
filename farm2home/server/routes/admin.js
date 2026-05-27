const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { generateEmbedding } = require('../utils/embeddings');

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'farm2home_admin_2024';

// Middleware — check admin secret
const adminAuth = (req, res, next) => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== ADMIN_SECRET) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  next();
};

// GET all transport users with licence status
router.get('/transport-users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ role: 'transport' }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH approve licence
router.patch('/verify-licence/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { licenceVerified: true },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Licence verified', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH reject licence
router.patch('/reject-licence/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { licenceVerified: false, licenceUrl: '' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Licence rejected', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST embed all products without embeddings
router.post('/embed-products', adminAuth, async (req, res) => {
  try {
    const products = await Product.find({ embedding: { $size: 0 } });
    if (products.length === 0) {
      return res.json({ message: 'All products already embedded', count: 0 });
    }

    res.json({ message: 'Embedding started for ' + products.length + ' products. Check server logs.' });

    // Run in background
    (async () => {
      let success = 0;
      for (const p of products) {
        try {
          const text = p.title + ' ' + p.description + ' ' + p.category;
          p.embedding = await generateEmbedding(text);
          await p.save();
          console.log('Embedded:', p.title);
          success++;
        } catch (err) {
          console.error('Failed:', p.title, err.message);
        }
      }
      console.log('Embedding done:', success + '/' + products.length);
    })();

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET embedding status
router.get('/embed-status', adminAuth, async (req, res) => {
  try {
    const total = await Product.countDocuments();
    const embedded = await Product.countDocuments({ 'embedding.0': { $exists: true } });
    const notEmbedded = await Product.find({ embedding: { $size: 0 } }).select('title');
    res.json({
      total,
      embedded,
      notEmbedded: notEmbedded.map(p => p.title)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
