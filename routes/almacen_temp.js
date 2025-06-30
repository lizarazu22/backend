const express = require('express');
const router = express.Router();
const AlmacenTemp = require('../models/almacen_temp');
const Producto = require('../models/product');

router.get('/', async (req, res) => {
  const registros = await AlmacenTemp.find();
  res.json(registros);
});

router.post('/confirmar/:id', async (req, res) => {
  const registro = await AlmacenTemp.findById(req.params.id);
  if (!registro) return res.status(404).json({ message: 'Registro no encontrado' });

  const productos = registro.data.map(p => ({
    nombre: p['Producto'] || 'Sin nombre',
    descripcion: p['DESCRIPCION'] || 'Sin descripción',
    precio: p['PRECIO'] || 0,
    categoria: p['TITULO'] || 'Sin categoría',
    stock: p['CONOS EN ALMACEN'] || 0,
  }));

  await Producto.insertMany(productos);
  await AlmacenTemp.findByIdAndDelete(req.params.id);

  res.json({ message: 'Productos cargados al catálogo correctamente' });
});

module.exports = router;
