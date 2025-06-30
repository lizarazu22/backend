const Usuario = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger'); // 👉 logger

// Registro de usuario
exports.signup = async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  try {
    const existeUsuario = await Usuario.findOne({ email });
    if (existeUsuario) {
      logger.warn(`Intento de registro con correo ya usado: ${email}`);
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const nuevoUsuario = new Usuario({ nombre, email, password, rol: rol || 'cliente' });
    await nuevoUsuario.save();

    logger.info(`Nuevo usuario registrado: ${email}`);
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    logger.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      logger.warn(`Intento de login con correo no registrado: ${email}`);
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    const esValido = await bcrypt.compare(password, usuario.password);
    if (!esValido) {
      logger.warn(`Password incorrecto para el correo: ${email}`);
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    logger.info(`Usuario logueado: ${email}`);

    res.status(200).json({
      token,
      user: {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    logger.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
