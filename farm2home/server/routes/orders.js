const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

// POST place order (buyer only)
router.post('/', authMiddleware, roleMiddleware('buyer'), async (req, res) => {
  try {
    const { items, deliveryAddress, phone } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }
    if (!deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Reduce product quantity
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: -item.quantity }
      });
    }

    const order = new Order({
      buyerId: req.user.id,
      buyerName: req.user.name,
      items,
      totalAmount,
      deliveryAddress,
      phone,
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error('ORDER ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET buyer's orders
router.get('/my', authMiddleware, roleMiddleware('buyer'), async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET single order
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;