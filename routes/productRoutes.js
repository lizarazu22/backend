const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.post('/procesar/migrar', productController.migrarDesdeAlmacenTemp);

module.exports = router;
