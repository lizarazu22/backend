const rateLimit = require('express-rate-limit');

const isTestEnv = process.env.NODE_ENV === 'test';

// Limitar a 5 intentos cada 5 minutos en login
const loginLimiter = isTestEnv
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutos
      max: 5,
      message: {
        message: 'Demasiados intentos de login, intenta de nuevo en 5 minutos.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

// Limitar a 3 solicitudes de reset password cada 60 minutos por IP
const resetPasswordLimiter = isTestEnv
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 60 * 60 * 1000, // 60 minutos
      max: 3,
      message: {
        message: 'Demasiadas solicitudes de recuperación, intenta más tarde.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

// Limitar a 5 registros nuevos cada 30 minutos
const signupLimiter = isTestEnv
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 30 * 60 * 1000, // 30 minutos
      max: 5,
      message: {
        message: 'Demasiados registros recientes, intenta más tarde.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

// Limitar a 100 solicitudes generales cada 15 minutos por IP
const generalLimiter = isTestEnv
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100,
      message: 'Demasiadas peticiones desde esta IP, intenta más tarde.',
      standardHeaders: true,
      legacyHeaders: false,
    });

module.exports = { loginLimiter, resetPasswordLimiter, signupLimiter, generalLimiter };
