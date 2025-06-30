const Gasto = require('../models/gasto');
const logger = require('../config/logger'); // 👉 logger

exports.crearGasto = async (req, res) => {
  try {
    const { descripcion, monto } = req.body;
    if (!descripcion || !monto) {
      logger.warn('Intento de crear gasto sin todos los campos requeridos');
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const gasto = new Gasto({ descripcion, monto });
    await gasto.save();

    logger.info(`Nuevo gasto registrado: ${descripcion} — ${monto} Bs`);
    res.status(201).json({ message: 'Gasto registrado correctamente.', gasto });
  } catch (error) {
    logger.error('Error al registrar gasto:', error);
    res.status(500).json({ message: 'Error al registrar gasto', error });
  }
};

exports.obtenerGastosPorFechas = async (req, res) => {
  const { desde, hasta } = req.query;
  try {
    const gastos = await Gasto.find({
      fecha: { $gte: new Date(desde), $lte: new Date(hasta) }
    });
    logger.info(`Consulta de gastos entre ${desde} y ${hasta}`);
    res.json(gastos);
  } catch (error) {
    logger.error('Error al obtener gastos por fechas:', error);
    res.status(500).json({ message: 'Error al obtener gastos', error });
  }
};

exports.obtenerTodosLosGastos = async (req, res) => {
  try {
    const gastos = await Gasto.find();
    logger.info('Consulta de todos los gastos realizada');
    res.json(gastos);
  } catch (error) {
    logger.error('Error al obtener todos los gastos:', error);
    res.status(500).json({ message: 'Error al obtener gastos', error });
  }
};
