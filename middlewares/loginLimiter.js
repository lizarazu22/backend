const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, // solo 5 intentos de login por IP cada 15 min
  message: 'Demasiados intentos de login fallidos, intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = loginLimiter;
