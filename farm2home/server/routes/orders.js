const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Trip = require('../models/Trip');
const User = require('../models/User');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, roleMiddleware('buyer'), async (req, res) => {
  try {
    const { items, deliveryAddress, phone } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: 'No items in order' });
    if (!deliveryAddress) return res.status(400).json({ message: 'Delivery address required' });
    if (!phone) return res.status(400).json({ message: 'Phone number required' });

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Enrich items with farmer details and reduce quantity
    const enrichedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      // Check quantity available
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: product.title + ' only has ' + product.quantity + ' ' + product.unit + ' available' });
      }

      // Reduce quantity
      await Product.findByIdAndUpdate(item.productId, { $inc: { quantity: -item.quantity } });

      // Get farmer phone
      const farmer = await User.findById(product.farmerId);

      enrichedItems.push({
        productId: item.productId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        image: item.image || '',
        farmerName: product.farmerName,
        farmerId: product.farmerId,
        farmerPhone: farmer?.phone || '',
        farmerLocation: product.farmerLocation || '',
      });
    }

    const order = new Order({
      buyerId: req.user.id,
      buyerName: req.user.name,
      buyerPhone: req.user.phone || phone,
      items: enrichedItems,
      totalAmount,
      deliveryAddress,
      phone,
    });

    await order.save();

    // Auto-create trips per farmer
    const farmerMap = {};
    for (const item of enrichedItems) {
      const fid = item.farmerId.toString();
      if (!farmerMap[fid]) {
        farmerMap[fid] = {
          farmerName: item.farmerName,
          farmerLocation: item.farmerLocation || 'Location not set',
          farmerPhone: item.farmerPhone || '',
          items: [],
          totalWeight: 0,
        };
      }
      farmerMap[fid].items.push(item);
      farmerMap[fid].totalWeight += item.quantity;
    }

    for (const [farmerId, data] of Object.entries(farmerMap)) {
      const payment = Math.round(data.totalWeight * 10 + 50 * 5);
      const productNames = data.items.map(i => i.title + ' (' + i.quantity + ' ' + i.unit + ')').join(', ')
      await Trip.create({
        pickupLocation: data.farmerLocation,
        deliveryLocation: deliveryAddress,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        weight: data.totalWeight,
        payment,
        orderId: order._id,
        farmerName: data.farmerName,
        farmerPhone: data.farmerPhone,
        buyerName: req.user.name,
        buyerPhone: phone,
        products: productNames,
      });
    }

    res.status(201).json(order);
  } catch (err) {
    console.error('ORDER ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET buyer orders
router.get('/my', authMiddleware, roleMiddleware('buyer'), async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET farmer orders — shows orders containing their products
router.get('/farmer', authMiddleware, roleMiddleware('farmer'), async (req, res) => {
  try {
    const orders = await Order.find({ 'items.farmerId': req.user.id }).sort({ createdAt: -1 });
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
