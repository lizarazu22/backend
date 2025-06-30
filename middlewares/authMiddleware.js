const jwt = require('jsonwebtoken');
const Usuario = require('../models/user');
const logger = require('../config/logger');

// Middleware de autenticación
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    logger.warn('Intento de acceso sin token');
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) {
      logger.warn('Token válido pero usuario no encontrado');
      return res.status(401).json({ message: 'Usuario no válido' });
    }

    req.user = {
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };

    next();
  } catch (err) {
    logger.error('Error autenticando token:', err);
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = authMiddleware;
