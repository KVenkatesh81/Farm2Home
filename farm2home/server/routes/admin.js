const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Trip = require('../models/Trip');
const { generateEmbedding } = require('../utils/embeddings');
const { authMiddleware } = require('../middleware/auth');

// Admin middleware
const adminOnly = (req, res, next) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin access only' });
  next();
};

// GET dashboard stats
router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [totalUsers, pendingUsers, totalProducts, totalOrders, totalTrips] = await Promise.all([
      User.countDocuments({ isAdmin: false }),
      User.countDocuments({ verificationStatus: 'pending', isAdmin: false }),
      Product.countDocuments(),
      Order.countDocuments(),
      Trip.countDocuments(),
    ]);
    res.json({ totalUsers, pendingUsers, totalProducts, totalOrders, totalTrips });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all users
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { role, status } = req.query;
    let filter = { isAdmin: false };
    if (role) filter.role = role;
    if (status) filter.verificationStatus = status;
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH verify user
router.patch('/verify-user/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, verificationStatus: 'verified', rejectionReason: '' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User verified successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH reject user
router.patch('/reject-user/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: false, verificationStatus: 'rejected', rejectionReason: reason || 'Not specified' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User rejected', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET transport users for licence approval
router.get('/transport-users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'transport', isAdmin: false }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH verify licence
router.patch('/verify-licence/:id', authMiddleware, adminOnly, async (req, res) => {
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
router.patch('/reject-licence/:id', authMiddleware, adminOnly, async (req, res) => {
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

// POST embed products
router.post('/embed-products', authMiddleware, adminOnly, async (req, res) => {
  try {
    const products = await Product.find({ embedding: { $size: 0 } });
    if (products.length === 0) return res.json({ message: 'All products already embedded', count: 0 });

    res.json({ message: `Embedding started for ${products.length} products` });

    (async () => {
      for (const p of products) {
        try {
          const text = p.title + ' ' + p.description + ' ' + p.category;
          p.embedding = await generateEmbedding(text);
          await p.save();
          console.log('Embedded:', p.title);
        } catch (err) {
          console.error('Failed:', p.title, err.message);
        }
      }
      console.log('Embedding done!');
    })();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET embed status
router.get('/embed-status', authMiddleware, adminOnly, async (req, res) => {
  try {
    const total = await Product.countDocuments();
    const embedded = await Product.countDocuments({ 'embedding.0': { $exists: true } });
    const notEmbedded = await Product.find({ embedding: { $size: 0 } }).select('title');
    res.json({ total, embedded, notEmbedded: notEmbedded.map(p => p.title) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
