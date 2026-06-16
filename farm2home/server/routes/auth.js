const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@farm2home.com';

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, licenceNumber, location, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isAdmin = email === ADMIN_EMAIL;

    const user = new User({
      name, email,
      password: hashedPassword,
      role,
      phone: phone || '',
      licenceNumber: licenceNumber || '',
      location: location || '',
      isAdmin,
      isVerified: isAdmin, // admin is auto verified
      verificationStatus: isAdmin ? 'verified' : 'pending'
    });

    await user.save();
    res.status(201).json({ message: 'Registered successfully. Please wait for admin verification.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    // Admin can login without role check
    if (!user.isAdmin && user.role !== role) {
      return res.status(400).json({ message: `This account is not a ${role} account` });
    }

    // Check verification — skip for admin
    if (!user.isAdmin && !user.isVerified) {
      if (user.verificationStatus === 'rejected') {
        return res.status(403).json({
          message: 'Your account has been rejected.',
          reason: user.rejectionReason || 'Contact admin for details.',
          status: 'rejected'
        });
      }
      return res.status(403).json({
        message: 'Your account is pending verification. Please wait for admin approval.',
        status: 'pending'
      });
    }

    // Transport licence check
    if (!user.isAdmin && role === 'transport' && !user.licenceVerified) {
      return res.status(403).json({
        message: 'Licence not verified',
        needsLicence: !user.licenceUrl,
        pendingVerification: !!user.licenceUrl
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user._id, role: user.isAdmin ? 'admin' : user.role, name: user.name, location: user.location, phone: user.phone, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.isAdmin ? 'admin' : user.role,
        location: user.location,
        phone: user.phone,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
