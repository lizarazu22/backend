const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');
const getUploader = require('../middlewares/upload');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkAdmin } = require('../middlewares/roleMiddleware');
const { cambiarEstadoValidator, validarParamsId } = require('../middlewares/validators/ventaValidators');
const handleValidationErrors = require('../middlewares/handleValidationErrors');

const upload = getUploader('comprobantes');

// Registrar venta con comprobante (sin crearVentaValidator aquí)
router.post(
  '/',
  authMiddleware,
  upload.single('comprobante'),
  ventaController.crearVenta
);

// Consultas
router.get('/por-usuario/:usuarioId', authMiddleware, validarParamsId('usuarioId'), handleValidationErrors, ventaController.obtenerVentasPorUsuario);
router.get('/por-fechas', authMiddleware, checkAdmin, ventaController.obtenerVentasPorFechas);
router.get('/filtrar', authMiddleware, checkAdmin, ventaController.obtenerVentasPorUsuarioYFechas);
router.get('/cierre-caja', authMiddleware, checkAdmin, ventaController.obtenerCierreCaja);
router.get('/resumen-mensual', authMiddleware, checkAdmin, ventaController.resumenMensual);
router.get('/recalcular-totales', authMiddleware, checkAdmin, ventaController.recalcularTotales);
router.get('/top-comprador', authMiddleware, checkAdmin, ventaController.topComprador);
router.get('/top-compradores', authMiddleware, checkAdmin, ventaController.topCompradores);
router.get('/', authMiddleware, checkAdmin, ventaController.obtenerTodasLasVentas);

// Cambiar estado de venta
router.put(
  '/:id/estado',
  authMiddleware,
  checkAdmin,
  validarParamsId('id'),
  cambiarEstadoValidator,
  handleValidationErrors,
  ventaController.cambiarEstadoVenta
);

module.exports = router;
