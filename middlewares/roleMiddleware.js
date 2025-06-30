const logger = require('../config/logger');

// Middleware para verificar si el usuario tiene rol de admin
const checkAdmin = (req, res, next) => {
  if (!req.user || req.user.rol !== 'admin') {
    logger.warn(`Intento de acceso no autorizado por ${req.user ? req.user.nombre : 'desconocido'} (${req.user ? req.user.rol : 'sin rol'})`);
    return res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
  }
  next();
};

module.exports = { checkAdmin };
