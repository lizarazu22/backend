const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');

const getStorage = (folder = 'comprobantes') => new CloudinaryStorage({
  cloudinary, // ahora sí cloudinary.v2 real
  params: {
    folder: folder,
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});


const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes .jpg, .jpeg o .png.'));
  }
};

const getUploader = (folder) => multer({
  storage: getStorage(folder),
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

module.exports = getUploader;
