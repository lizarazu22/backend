const express = require('express');
const router = express.Router();
const Producto = require('../models/product');
const AuditLog = require('../models/auditLog');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const { cloudinary, storage } = require('../config/cloudinary');

// Multer storage con Cloudinary
const upload = multer({ storage });

// 👉 Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// 👉 Crear producto con imágenes en Cloudinary
router.post('/', authMiddleware, upload.array('imagenes'), async (req, res) => {
  try {
    const { nombre, precio, stock, categoria, material, color, densidad } = req.body;
    const imagenesUrls = req.files.map(file => file.path);

    const nuevoProducto = new Producto({
      nombre,
      descripcion: 'Agregado manualmente desde Admin',
      precio,
      categoria: categoria || 'General',
      material,
      color,
      densidad,
      stock,
      imagenes: imagenesUrls
    });

    await nuevoProducto.save();

    await AuditLog.create({
      accion: 'crear producto',
      recurso: 'Producto',
      recursoId: nuevoProducto._id,
      admin: { id: req.user._id, nombre: req.user.nombre },
      datosNuevos: nuevoProducto
    });

    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear producto' });
  }
});

// 👉 Subir nuevas imágenes a producto (Cloudinary)
router.post('/:id/imagenes', authMiddleware, upload.array('imagenes'), async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

    const nuevasImagenes = req.files.map(file => file.path);
    producto.imagenes.push(...nuevasImagenes);
    await producto.save();

    await AuditLog.create({
      accion: 'subir imagenes producto',
      recurso: 'Producto',
      recursoId: producto._id,
      admin: { id: req.user._id, nombre: req.user.nombre },
      datosNuevos: { nuevasImagenes }
    });

    res.json({ message: 'Imágenes agregadas correctamente', producto });
  } catch (error) {
    res.status(500).json({ message: 'Error subiendo imágenes' });
  }
});

// 👉 Editar producto
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const productoAntes = await Producto.findById(req.params.id);
    const productoActualizado = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });

    await AuditLog.create({
      accion: 'editar producto',
      recurso: 'Producto',
      recursoId: req.params.id,
      admin: { id: req.user._id, nombre: req.user.nombre },
      datosPrevios: productoAntes,
      datosNuevos: productoActualizado
    });

    res.json(productoActualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
});

// 👉 Eliminar producto
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const productoEliminado = await Producto.findById(req.params.id);
    await Producto.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      accion: 'eliminar producto',
      recurso: 'Producto',
      recursoId: req.params.id,
      admin: { id: req.user._id, nombre: req.user.nombre },
      datosPrevios: productoEliminado
    });

    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
});

// 👉 Eliminar imagen individual del producto
router.put('/:id/imagenes/eliminar', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

    producto.imagenes = producto.imagenes.filter(img => img !== url);
    await producto.save();

    res.json({ message: 'Imagen eliminada', producto });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando imagen' });
  }
});

module.exports = router;
