const { body, param } = require('express-validator');
const mongoose = require('mongoose');

exports.agregarProductoValidator = [
  body('producto.productoId')
    .custom(id => mongoose.Types.ObjectId.isValid(id))
    .withMessage('productoId inválido'),
  body('producto.cantidad')
    .isInt({ min: 1 })
    .withMessage('Cantidad debe ser un número entero mayor a 0')
];

exports.actualizarCantidadValidator = [
  param('productoId')
    .custom(id => mongoose.Types.ObjectId.isValid(id))
    .withMessage('productoId inválido'),
  body('cantidad')
    .isInt({ min: 1 })
    .withMessage('Cantidad debe ser mayor a 0')
];
