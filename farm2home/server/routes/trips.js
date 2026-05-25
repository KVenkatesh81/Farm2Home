const express = require('express');
const Trip = require('../models/Trip');
const Order = require('../models/Order');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET all available trips
router.get('/', authMiddleware, roleMiddleware('transport'), async (req, res) => {
  try {
    const trips = await Trip.find({ status: 'available' }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET my accepted trips
router.get('/my', authMiddleware, roleMiddleware('transport'), async (req, res) => {
  try {
    const trips = await Trip.find({ assignedTransporterId: req.user.id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST accept a trip
router.post('/:id/accept', authMiddleware, roleMiddleware('transport'), async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.status !== 'available') return res.status(400).json({ message: 'Trip already taken' });

    trip.status = 'accepted';
    trip.assignedTransporterId = req.user.id;
    trip.assignedTransporterName = req.user.name;
    await trip.save();

    // Update order status to confirmed
    if (trip.orderId) {
      await Order.findByIdAndUpdate(trip.orderId, { deliveryStatus: 'confirmed' });
    }

    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST mark trip as delivered
router.post('/:id/complete', authMiddleware, roleMiddleware('transport'), async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, assignedTransporterId: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.status !== 'accepted') return res.status(400).json({ message: 'Trip not accepted yet' });

    trip.status = 'completed';
    await trip.save();

    // Update order status to delivered
    if (trip.orderId) {
      await Order.findByIdAndUpdate(trip.orderId, { deliveryStatus: 'delivered' });
    }

    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create trip manually
router.post('/', async (req, res) => {
  try {
    const trip = new Trip(req.body);
    await trip.save();
    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
