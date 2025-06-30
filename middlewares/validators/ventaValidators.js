const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

exports.crearVentaValidator = [
  body('usuarioId')
    .custom(id => mongoose.Types.ObjectId.isValid(id))
    .withMessage('usuarioId inválido'),
  body('productos')
    .custom(productos => Array.isArray(productos) && productos.length > 0)
    .withMessage('Debe incluir al menos un producto en la venta')
];

exports.validarParamsId = (campo) => [
  param(campo)
    .custom(id => mongoose.Types.ObjectId.isValid(id))
    .withMessage(`${campo} inválido`)
];

exports.filtrarPorFechasValidator = [
  query('desde').isISO8601().withMessage('Fecha "desde" inválida'),
  query('hasta').isISO8601().withMessage('Fecha "hasta" inválida')
];

exports.cambiarEstadoValidator = [
    body('estado')
      .isIn(['standby', 'confirmado', 'rechazado'])
      .withMessage('Estado inválido')
  ];
  