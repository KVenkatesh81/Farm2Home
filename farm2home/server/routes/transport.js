const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { storage } = require('../config/cloudinary');
const router = express.Router();

const upload = multer({ storage });

// Upload licence
router.post('/upload-licence', authMiddleware, roleMiddleware('transport'), upload.single('licence'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.licenceUrl = req.file.path;
    user.licenceNumber = req.body.licenceNumber || '';
    await user.save();

    res.json({ message: 'Licence uploaded successfully. Pending verification.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin approve licence (no UI — use Postman)
router.patch('/verify/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { licenceVerified: true },
      { new: true }
    );
    res.json({ message: 'Licence verified', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;