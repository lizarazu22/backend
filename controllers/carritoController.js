const Carrito = require('../models/carrito');

// Obtener carrito
exports.obtenerCarrito = async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ usuarioId: req.params.usuarioId });
    res.status(200).json(carrito || { productos: [] });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener carrito', error: err });
  }
};

// Agregar producto
exports.agregarProducto = async (req, res) => {
  const { productoId, nombre, cantidad, precio } = req.body;

  try {
    let carrito = await Carrito.findOne({ usuarioId: req.params.usuarioId });

    if (!carrito) {
      carrito = new Carrito({
        usuarioId: req.params.usuarioId,
        productos: [{ productoId, nombre, cantidad, precio }]
      });
    } else {
      const productoExistente = carrito.productos.find(p => p.productoId == productoId);
      if (productoExistente) {
        productoExistente.cantidad += cantidad;
      } else {
        carrito.productos.push({ productoId, nombre, cantidad, precio });
      }
    }

    await carrito.save();
    res.status(200).json(carrito);
  } catch (err) {
    res.status(500).json({ message: 'Error al agregar producto', error: err });
  }
};

// Eliminar producto
exports.eliminarProducto = async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ usuarioId: req.params.usuarioId });
    carrito.productos = carrito.productos.filter(p => p.productoId != req.params.productoId);
    await carrito.save();
    res.status(200).json(carrito);
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar producto', error: err });
  }
};

// Vaciar carrito
exports.vaciarCarrito = async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ usuarioId: req.params.usuarioId });
    carrito.productos = [];
    await carrito.save();
    res.status(200).json({ message: 'Carrito vaciado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al vaciar carrito', error: err });
  }
};
