const express = require('express');
const router = express.Router();
const Usuario = require('../models/user');
const AuditLog = require('../models/auditLog');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkAdmin } = require('../middlewares/roleMiddleware');

// Obtener todos los usuarios (solo admins)
router.get('/', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// Crear usuario (solo admins)
router.post('/', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const existeUsuario = await Usuario.findOne({ email });
    if (existeUsuario) return res.status(400).json({ message: 'Correo ya registrado' });

    const nuevoUsuario = new Usuario({ nombre, email, password, rol });
    await nuevoUsuario.save();

    res.status(201).json(nuevoUsuario);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear usuario' });
  }
});

// Actualizar un usuario (solo admins)
router.put('/:id', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const usuarioAntes = await Usuario.findById(req.params.id);
    const usuarioActualizado = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });

    await AuditLog.create({
      accion: 'editar usuario',
      recurso: 'Usuario',
      recursoId: req.params.id,
      admin: {
        id: req.user._id,
        email: req.user.email
      },
      datosPrevios: usuarioAntes,
      datosNuevos: usuarioActualizado
    });

    res.json(usuarioActualizado);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
});

// Eliminar un usuario (solo admins)
router.delete('/:id', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const usuarioEliminado = await Usuario.findById(req.params.id);
    await Usuario.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      accion: 'eliminar usuario',
      recurso: 'Usuario',
      recursoId: req.params.id,
      admin: {
        id: req.user._id,
        email: req.user.email
      },
      datosPrevios: usuarioEliminado
    });

    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
});

module.exports = router;
