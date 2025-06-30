const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración de almacenamiento con Multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'productos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

module.exports = { cloudinary, storage };
