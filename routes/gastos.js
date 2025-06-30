const express = require('express');
const router = express.Router();
const Gasto = require('../models/gasto');
const AuditLog = require('../models/auditLog');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkAdmin } = require('../middlewares/roleMiddleware');
const logger = require('../config/logger');
const { crearGastoValidator, validarParamsId, validarQueryFechas } = require('../middlewares/validators/gastoValidators');
const handleValidationErrors = require('../middlewares/handleValidationErrors');

// Crear gasto (admin)
router.post('/', authMiddleware, checkAdmin, crearGastoValidator, handleValidationErrors, async (req, res) => {
  try {
    const nuevoGasto = new Gasto(req.body);
    await nuevoGasto.save();

    await AuditLog.create({
      accion: 'crear gasto',
      recurso: 'Gasto',
      recursoId: nuevoGasto._id,
      admin: {
        id: req.user._id,
        email: req.user.email
      },
      datosNuevos: nuevoGasto
    });

    logger.info(`Gasto creado por ${req.user.email}`);
    res.status(201).json(nuevoGasto);
  } catch (err) {
    logger.error('Error creando gasto:', err);
    res.status(500).json({ message: 'Error al crear gasto' });
  }
});

// Obtener todos (admin)
router.get('/', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const gastos = await Gasto.find();
    res.json(gastos);
  } catch (err) {
    logger.error('Error obteniendo gastos:', err);
    res.status(500).json({ message: 'Error al obtener gastos' });
  }
});

// Por fechas (admin)
router.get('/por-fechas', authMiddleware, checkAdmin, validarQueryFechas, handleValidationErrors, async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const gastos = await Gasto.find({
      fecha: {
        $gte: new Date(desde),
        $lte: new Date(hasta)
      }
    });
    res.json(gastos);
  } catch (err) {
    logger.error('Error filtrando gastos:', err);
    res.status(500).json({ message: 'Error al filtrar gastos' });
  }
});

// Eliminar (admin)
router.delete('/:id', authMiddleware, checkAdmin, validarParamsId(), handleValidationErrors, async (req, res) => {
  try {
    const gastoEliminado = await Gasto.findById(req.params.id);
    await Gasto.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      accion: 'eliminar gasto',
      recurso: 'Gasto',
      recursoId: req.params.id,
      admin: {
        id: req.user._id,
        email: req.user.email
      },
      datosPrevios: gastoEliminado
    });

    logger.info(`Gasto eliminado por ${req.user.email}`);
    res.json({ message: 'Gasto eliminado' });
  } catch (err) {
    logger.error('Error eliminando gasto:', err);
    res.status(500).json({ message: 'Error al eliminar gasto' });
  }
});

module.exports = router;
