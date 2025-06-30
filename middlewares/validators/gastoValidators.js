const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

exports.crearGastoValidator = [
  body('descripcion').isString().notEmpty().withMessage('Descripción requerida'),
  body('monto').isFloat({ gt: 0 }).withMessage('Monto debe ser mayor a 0'),
  body('fecha').isISO8601().withMessage('Fecha inválida')
];

exports.validarParamsId = (campo = 'id') => [
  param(campo)
    .custom(id => mongoose.Types.ObjectId.isValid(id))
    .withMessage(`${campo} inválido`)
];

exports.validarQueryFechas = [
  query('desde').isISO8601().withMessage('Fecha desde inválida'),
  query('hasta').isISO8601().withMessage('Fecha hasta inválida')
];
