const express = require('express');
const multer = require('multer');
const Product = require('../models/Product');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { storage } = require('../config/cloudinary');

const router = express.Router();
const upload = multer({ storage });

// GET all products (buyers see this)
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    let filter = { available: true };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET farmer's own products
router.get('/my', authMiddleware, roleMiddleware('farmer'), async (req, res) => {
  try {
    const products = await Product.find({ farmerId: req.user.id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create product (farmer only)
router.post('/', authMiddleware, roleMiddleware('farmer'), upload.array('images', 4), async (req, res) => {
  try {
    const { title, description, price, quantity, unit, category } = req.body;
    const images = req.files ? req.files.map(f => f.path) : [];

    const product = new Product({
      title,
      description,
      price: Number(price),
      quantity: Number(quantity),
      unit,
      category,
      images,
      farmerId: req.user.id,
      farmerName: req.user.name,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('PRODUCT ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// PUT update product (farmer only)
router.put('/:id', authMiddleware, roleMiddleware('farmer'), async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, farmerId: req.user.id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { title, description, price, quantity, unit, category, available } = req.body;
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = Number(price);
    if (quantity) product.quantity = Number(quantity);
    if (unit) product.unit = unit;
    if (category) product.category = category;
    if (available !== undefined) product.available = available;

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE product (farmer only)
router.delete('/:id', authMiddleware, roleMiddleware('farmer'), async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, farmerId: req.user.id });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;