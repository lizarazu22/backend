const { body } = require('express-validator');

const signupValidator = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),

  body('email')
    .isEmail().withMessage('Debes proporcionar un correo válido'),

  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener mínimo 6 caracteres')
];

const loginValidator = [
  body('email')
    .isEmail().withMessage('Correo inválido'),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
];

module.exports = { signupValidator, loginValidator };
