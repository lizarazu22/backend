const Usuario = require('../models/user');
const AuditLog = require('../models/auditLog');

// Obtener todos los usuarios
exports.obtenerTodosLosUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('_id nombre email rol creadoEn');
    res.status(200).json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios', error });
  }
};

// Actualizar un usuario
exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol } = req.body;

    const usuarioAntes = await Usuario.findById(id);
    if (!usuarioAntes) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      { nombre, email, rol },
      { new: true }
    );

    await AuditLog.create({
      accion: 'editar usuario',
      recurso: 'Usuario',
      recursoId: id,
      admin: {
        id: req.user._id,
        email: req.user.email
      },
      datosPrevios: usuarioAntes,
      datosNuevos: usuarioActualizado
    });

    res.status(200).json(usuarioActualizado);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error al actualizar usuario', error });
  }
};

// Eliminar un usuario
exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuarioEliminado = await Usuario.findById(id);
    if (!usuarioEliminado) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await Usuario.findByIdAndDelete(id);

    await AuditLog.create({
      accion: 'eliminar usuario',
      recurso: 'Usuario',
      recursoId: id,
      admin: {
        id: req.user._id,
        email: req.user.email
      },
      datosPrevios: usuarioEliminado
    });

    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario', error });
  }
};
