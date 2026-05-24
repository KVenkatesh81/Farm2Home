const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'dxzmbuh2l',
  api_key: '759577437195125',
  api_secret: '7r5jm-VEkKJr0zti60pPlWGTifY',
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'farm2home',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
  },
});

module.exports = { cloudinary, storage };
