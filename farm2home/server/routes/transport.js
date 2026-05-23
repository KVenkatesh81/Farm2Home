const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const { storage } = require('../config/cloudinary');
const router = express.Router();

const upload = multer({ storage });

// Upload licence — no auth needed, user identified by email
router.post('/upload-licence', upload.single('licence'), async (req, res) => {
  try {
    const { email, licenceNumber } = req.body;

    if (!req.file) return res.status(400).json({ message: 'No licence image uploaded' });

    const user = await User.findOne({ email, role: 'transport' });
    if (!user) return res.status(404).json({ message: 'Transport user not found with this email' });

    user.licenceUrl = req.file.path;
    user.licenceNumber = licenceNumber || '';
    await user.save();

    res.json({ message: 'Licence uploaded successfully. Pending verification.' });
  } catch (err) {
    console.error('LICENCE ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Admin approve licence — use Postman to call this
router.patch('/verify/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { licenceVerified: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Licence verified', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;