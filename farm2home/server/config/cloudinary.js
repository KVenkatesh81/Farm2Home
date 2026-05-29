const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'dxzmbuh2l',
  api_key: '759577437195125',
  api_secret: '7r5jm-VEkKJr0zti60pPlWGTifY',
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'farm2home',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: isVideo
        ? ['mp4', 'mov', 'avi', 'mkv']
        : ['jpg', 'jpeg', 'png', 'webp'],
      transformation: isVideo
        ? [{ width: 720, crop: 'limit' }]
        : [{ width: 800, height: 600, crop: 'limit' }],
    };
  },
});

const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'farm2home/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv'],
    transformation: [{ width: 720, crop: 'limit' }],
  },
});

module.exports = { cloudinary, storage, videoStorage };
