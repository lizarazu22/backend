const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Carrito = require('../models/carrito');
const Producto = require('../models/product');

const { agregarProductoValidator, actualizarCantidadValidator } = require('../middlewares/validators/carritoValidators');
const handleValidationErrors = require('../middlewares/handleValidationErrors');
const authMiddleware = require('../middlewares/authMiddleware');

// Agregar producto al carrito
router.post('/agregar', authMiddleware, agregarProductoValidator, handleValidationErrors, async (req, res) => {
  const { producto } = req.body;
  const usuarioId = req.user._id;

  try {
    const prod = await Producto.findById(producto.productoId);
    if (!prod) return res.status(404).json({ message: 'Producto no encontrado' });

    if (prod.stock < producto.cantidad) {
      return res.status(400).json({ message: 'Cantidad solicitada supera el stock disponible.' });
    }

    const carrito = await Carrito.findOneAndUpdate(
      { usuarioId },
      { $setOnInsert: { usuarioId, productos: [] } },
      { upsert: true, new: true }
    );

    const existente = carrito.productos.find(p => p.productoId.toString() === producto.productoId);
    if (existente) {
      existente.cantidad += producto.cantidad;
    } else {
      carrito.productos.push({
        productoId: producto.productoId,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: producto.cantidad,
        imagen: prod.imagenes[0] || '',
        categoria: prod.categoria || '',
        material: prod.material || '',
        color: prod.color || '',
        densidad: prod.densidad || ''
      });
    }

    await carrito.save();
    res.status(200).json({ message: 'Producto agregado al carrito', carrito });
  } catch (err) {
    console.error('Error al agregar producto:', err);
    res.status(500).json({ message: 'Error al agregar producto', error: err });
  }
});

// Obtener carrito de un usuario con stock actualizado
router.get('/', authMiddleware, async (req, res) => {
  const usuarioId = req.user._id;

  try {
    const carrito = await Carrito.findOne({ usuarioId });
    if (!carrito) return res.status(200).json({ productos: [] });

    const productosConStock = await Promise.all(
      carrito.productos.map(async (item) => {
        const prod = await Producto.findById(item.productoId);
        return {
          ...item.toObject(),
          stock: prod ? prod.stock : 0
        };
      })
    );

    res.status(200).json({
      _id: carrito._id,
      usuarioId: carrito.usuarioId,
      creadoEn: carrito.creadoEn,
      productos: productosConStock
    });

  } catch (err) {
    console.error('Error al obtener carrito:', err);
    res.status(500).json({ message: 'Error al obtener carrito', error: err });
  }
});

// Vaciar carrito
router.delete('/', authMiddleware, async (req, res) => {
  const usuarioId = req.user._id;

  try {
    await Carrito.deleteOne({ usuarioId });
    res.status(200).json({ message: 'Carrito vaciado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al vaciar carrito', error: err });
  }
});

// Eliminar producto específico del carrito
router.delete('/producto/:productoId', authMiddleware, async (req, res) => {
  const usuarioId = req.user._id;
  const { productoId } = req.params;

  try {
    const carrito = await Carrito.findOne({ usuarioId });
    if (!carrito) return res.status(404).json({ message: 'Carrito no encontrado' });

    carrito.productos = carrito.productos.filter(p => p.productoId.toString() !== productoId);
    await carrito.save();

    res.status(200).json({ message: 'Producto eliminado del carrito', carrito });
  } catch (err) {
    console.error('Error eliminando producto:', err);
    res.status(500).json({ message: 'Error al eliminar producto', error: err });
  }
});

// Actualizar cantidad de un producto en carrito
router.put('/producto/:productoId', authMiddleware, actualizarCantidadValidator, handleValidationErrors, async (req, res) => {
  const usuarioId = req.user._id;
  const { productoId } = req.params;
  const { cantidad } = req.body;

  try {
    const carrito = await Carrito.findOne({ usuarioId });
    if (!carrito) return res.status(404).json({ message: 'Carrito no encontrado' });

    const productoEnCarrito = carrito.productos.find(p => p.productoId.toString() === productoId);
    if (!productoEnCarrito) return res.status(404).json({ message: 'Producto no encontrado en el carrito' });

    const prod = await Producto.findById(productoId);
    if (!prod || prod.stock < cantidad) {
      return res.status(400).json({ message: 'Stock insuficiente para esta cantidad.' });
    }

    productoEnCarrito.cantidad = cantidad;
    await carrito.save();

    res.json({ message: 'Cantidad actualizada correctamente', carrito });
  } catch (error) {
    console.error('Error actualizando cantidad:', error);
    res.status(500).json({ message: 'Error actualizando cantidad' });
  }
});

module.exports = router;
