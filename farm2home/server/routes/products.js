const express = require('express');
const multer = require('multer');
const Product = require('../models/Product');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { storage, videoStorage } = require('../config/cloudinary');
const multerVideo = require('multer')({ storage: videoStorage });
const { generateEmbedding } = require('../utils/embeddings');

const router = express.Router();
const upload = multer({ storage });

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

router.get('/my', authMiddleware, roleMiddleware('farmer'), async (req, res) => {
  try {
    const products = await Product.find({ farmerId: req.user.id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const queryEmbedding = await generateEmbedding(q);
    const results = await Product.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 10,
        }
      },
      { $match: { available: true } }
    ]);
    res.json(results);
  } catch (err) {
    console.error('SEARCH ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get('/similar/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.embedding.length) return res.json([]);
    const results = await Product.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: product.embedding,
          numCandidates: 50,
          limit: 5,
        }
      },
      {
        $match: {
          available: true,
          _id: { $ne: product._id }
        }
      }
    ]);
    res.json(results.slice(0, 4));
  } catch (err) {
    console.error('SIMILAR ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

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
      farmerLocation: req.user.location || '',
      embedding: [],
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('PRODUCT ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

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

router.delete('/:id', authMiddleware, roleMiddleware('farmer'), async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, farmerId: req.user.id });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST upload video for a product
router.post('/:id/video', authMiddleware, roleMiddleware('farmer'), multerVideo.single('video'), async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, farmerId: req.user.id });

    product.video = req.file.path;
    await product.save();
    res.json({ message: 'Video uploaded', video: req.file.path });
  } catch (err) {
    console.error('VIDEO ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST upload video for a product
router.post('/:id/video', authMiddleware, roleMiddleware('farmer'), multerVideo.single('video'), async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, farmerId: req.user.id });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!req.file) return res.status(400).json({ message: 'No video uploaded' });
    product.video = req.file.path;
    await product.save();
    res.json({ message: 'Video uploaded', video: req.file.path });
  } catch (err) {
    console.error('VIDEO ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
