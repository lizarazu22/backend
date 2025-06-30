const { query } = require('express-validator');

exports.validarOpcionesDeListado = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit debe ser un número entre 1 y 100'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page debe ser un número mayor a 0')
];
