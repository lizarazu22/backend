const express = require('express');
const router = express.Router();
const Producto = require('../models/product');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkAdmin } = require('../middlewares/roleMiddleware');
const { validarOpcionesDeListado } = require('../middlewares/validators/productValidators');
const handleValidationErrors = require('../middlewares/handleValidationErrors');
const logger = require('../config/logger');

// Obtener productos (público)
router.get('/', validarOpcionesDeListado, handleValidationErrors, async (req, res) => {
  try {
    const { limit = 100, page = 1 } = req.query;
    const productos = await Producto.find()
      .limit(Number(limit))
      .skip((page - 1) * limit);
    res.json(productos);
  } catch (error) {
    logger.error('Error al obtener productos', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// Asignar características random (admin)
router.get('/asignar-caracteristicas-random', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const productos = await Producto.find();
    if (!productos.length) return res.status(404).json({ message: 'No hay productos disponibles' });

    const categorias = ['Almohada', 'Colchón', 'Sábana', 'Cobija'];
    const materiales = ['Algodón', 'Espuma', 'Látex', 'Poliéster'];
    const colores = ['Blanco', 'Azul', 'Gris', 'Beige', 'Negro'];
    const densidades = ['Suave', 'Media', 'Firme'];

    for (let prod of productos) {
      prod.categoria = categorias[Math.floor(Math.random() * categorias.length)];
      prod.material = materiales[Math.floor(Math.random() * materiales.length)];
      prod.color = colores[Math.floor(Math.random() * colores.length)];
      prod.densidad = densidades[Math.floor(Math.random() * densidades.length)];
      await prod.save();
    }

    logger.info(`Características random asignadas a ${productos.length} productos por ${req.user?.email || 'sistema'}`);
    res.json({ message: 'Características asignadas correctamente', cantidad: productos.length });
  } catch (err) {
    logger.error('Error asignando características:', err);
    res.status(500).json({ message: 'Error asignando características.' });
  }
});

module.exports = router;
