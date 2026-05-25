const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Trip = require('../models/Trip');
const User = require('../models/User');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

// POST place order — auto creates trips
router.post('/', authMiddleware, roleMiddleware('buyer'), async (req, res) => {
  try {
    const { items, deliveryAddress, phone } = req.body;

    if (!items || items.length === 0) return res.status(400).json({ message: 'No items in order' });
    if (!deliveryAddress) return res.status(400).json({ message: 'Delivery address required' });
    if (!phone) return res.status(400).json({ message: 'Phone number required' });

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Reduce product quantity
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { quantity: -item.quantity } });
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

    // Auto-create trips for each unique farmer
    const farmerMap = {};
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const farmerId = product.farmerId.toString();
      if (!farmerMap[farmerId]) {
        farmerMap[farmerId] = {
          farmerName: product.farmerName,
          farmerLocation: product.farmerLocation || 'Farm location not set',
          items: [],
          totalWeight: 0,
        };
      }
      farmerMap[farmerId].items.push(item);
      farmerMap[farmerId].totalWeight += item.quantity;
    }

    // Create one trip per farmer
    for (const [farmerId, data] of Object.entries(farmerMap)) {
      const distance = 50; // default km
      const payment = Math.round(data.totalWeight * 10 + distance * 5);

      await Trip.create({
        pickupLocation: data.farmerLocation,
        deliveryLocation: deliveryAddress,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        weight: data.totalWeight,
        payment,
        orderId: order._id,
        farmerName: data.farmerName,
        buyerName: req.user.name,
        buyerPhone: phone,
      });
    }

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
