const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController'); // nombre correcto

// Endpoint para migrar productos desde AlmacenTemp a la colección formal de productos
router.post('/migrar', productController.migrarDesdeAlmacenTemp);

module.exports = router;
