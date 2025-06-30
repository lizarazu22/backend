const Venta = require('../models/venta');
const Producto = require('../models/product');
const Carrito = require('../models/carrito');
const Usuario = require('../models/user');
const logger = require('../config/logger');
const sgMail = require('../config/sendgrid');

exports.crearVenta = async (req, res) => {
  try {
    console.log('BODY RECIBIDO:', req.body);
    console.log('FILE RECIBIDO:', req.file);

    const { usuarioId, productos, fecha } = req.body;

    if (!usuarioId || !productos || productos.length === 0) {
      logger.warn('Intento de crear venta sin datos completos');
      return res.status(400).json({ message: 'Faltan datos para registrar la venta.' });
    }

    if (!req.file) {
      logger.warn('Intento de crear venta sin comprobante adjunto');
      return res.status(400).json({ message: 'Debes adjuntar una imagen del comprobante de pago.' });
    }

    const productosArray = typeof productos === 'string' ? JSON.parse(productos) : productos;

    let totalVenta = 0;
    for (const item of productosArray) {
      const productoDb = await Producto.findById(item.productoId);
      if (!productoDb) return res.status(404).json({ message: `Producto no encontrado: ${item.nombre}` });
      if (productoDb.stock < item.cantidad) {
        return res.status(400).json({ message: `Stock insuficiente para ${productoDb.nombre}` });
      }
      productoDb.stock -= item.cantidad;
      await productoDb.save();
      totalVenta += item.precio * item.cantidad;
    }

    const comprobante = req.file ? req.file.path : null;

    const venta = new Venta({
      usuarioId,
      productos: productosArray.map(p => ({ nombre: p.nombre, precio: p.precio, cantidad: p.cantidad })),
      total: totalVenta,
      comprobante,
      fecha: fecha ? new Date(fecha) : Date.now()
    });

    await venta.save();
    await Carrito.findOneAndDelete({ usuarioId });

    logger.info(`Venta registrada para usuario: ${usuarioId}, total: ${totalVenta}`);
    res.status(201).json({ message: 'Venta registrada correctamente.', venta });
  } catch (error) {
    logger.error('Error registrando venta:', error);
    res.status(500).json({ message: 'Error al registrar venta', error });
  }
};

exports.obtenerVentasPorUsuario = async (req, res) => {
  try {
    const ventas = await Venta.find({ usuarioId: req.params.usuarioId });
    res.json(ventas || []); // ✅ devolución segura
  } catch (error) {
    logger.error('Error al obtener ventas por usuario:', error);
    res.status(500).json([]);
  }
};

exports.obtenerVentasPorFechas = async (req, res) => {
  const { desde, hasta } = req.query;
  try {
    if (!desde || !hasta) return res.status(400).json({ message: 'Debes proporcionar ambas fechas' });
    const ventas = await Venta.find({ fecha: { $gte: new Date(desde), $lte: new Date(hasta) } });
    res.json(ventas || []);
  } catch (error) {
    logger.error('Error al obtener ventas por fechas:', error);
    res.status(500).json([]);
  }
};

exports.obtenerTodasLasVentas = async (req, res) => {
  try {
    const ventas = await Venta.find();
    res.json(ventas || []);
  } catch (error) {
    logger.error('Error al obtener todas las ventas:', error);
    res.status(500).json([]);
  }
};

exports.obtenerVentasPorUsuarioYFechas = async (req, res) => {
  const { usuarioId, desde, hasta } = req.query;
  try {
    const filtro = {};
    if (usuarioId) filtro.usuarioId = usuarioId;
    if (desde && hasta) filtro.fecha = { $gte: new Date(desde), $lte: new Date(hasta) };
    const ventas = await Venta.find(filtro);
    res.json(ventas || []);
  } catch (error) {
    logger.error('Error al obtener ventas por usuario y fechas:', error);
    res.status(500).json([]);
  }
};

exports.obtenerCierreCaja = async (req, res) => {
  const { desde, hasta } = req.query;
  try {
    if (!desde || !hasta) return res.status(400).json({ message: 'Debes proporcionar ambas fechas' });
    const ventas = await Venta.find({ fecha: { $gte: new Date(desde), $lte: new Date(hasta) } });
    const totalVentas = ventas.reduce((sum, v) => sum + (v.total || 0), 0);
    res.json({ ventas, totalVentas });
  } catch (error) {
    logger.error('Error al obtener cierre de caja:', error);
    res.status(500).json({ ventas: [], totalVentas: 0 });
  }
};

exports.resumenMensual = async (req, res) => {
  const { mes, mesAnterior } = req.query;
  try {
    const [anio, mesNum] = mes.split('-');
    const desde = new Date(anio, mesNum - 1, 1);
    const hasta = new Date(anio, mesNum, 0, 23, 59, 59);
    const ventasMes = await Venta.find({ fecha: { $gte: desde, $lte: hasta } });
    const totalMes = ventasMes.reduce((sum, v) => sum + (v.total || 0), 0);

    let totalMesAnterior = 0;
    if (mesAnterior) {
      const [anioAnt, mesAntNum] = mesAnterior.split('-');
      const desdeAnt = new Date(anioAnt, mesAntNum - 1, 1);
      const hastaAnt = new Date(anioAnt, mesAntNum, 0, 23, 59, 59);
      const ventasAnt = await Venta.find({ fecha: { $gte: desdeAnt, $lte: hastaAnt } });
      totalMesAnterior = ventasAnt.reduce((sum, v) => sum + (v.total || 0), 0);
    }

    res.json({
      totalMes,
      totalMesAnterior,
      variacion: totalMesAnterior ? ((totalMes - totalMesAnterior) / totalMesAnterior) * 100 : 0,
      ventasMes
    });
  } catch (err) {
    logger.error('Error obteniendo resumen mensual:', err);
    res.status(500).json({
      totalMes: 0,
      totalMesAnterior: 0,
      variacion: 0,
      ventasMes: []
    });
  }
};

exports.recalcularTotales = async (req, res) => {
  try {
    const ventas = await Venta.find();
    for (let venta of ventas) {
      const totalNuevo = venta.productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
      venta.total = totalNuevo;
      await venta.save();
    }
    logger.info('Totales de ventas recalculados correctamente.');
    res.json({ message: 'Totales actualizados correctamente.' });
  } catch (error) {
    logger.error('Error al recalcular totales:', error);
    res.status(500).json({ message: 'Error al recalcular totales' });
  }
};

exports.cambiarEstadoVenta = async (req, res) => {
  try {
    const { estado } = req.body;
    const venta = await Venta.findById(req.params.id);
    if (!venta) return res.status(404).json({ message: 'Venta no encontrada' });

    if (estado === 'rechazado' && venta.estado === 'standby') {
      for (let item of venta.productos) {
        const productoDb = await Producto.findOne({ nombre: item.nombre });
        if (productoDb) {
          productoDb.stock += item.cantidad;
          await productoDb.save();
        }
      }
    }

    venta.estado = estado;
    await venta.save();
    const usuario = await Usuario.findById(venta.usuarioId);
if (usuario && usuario.email) {
  const msg = {
    to: usuario.email,
    from: 'ignaciolizarazu00@gmail.com',
    subject: `Estado de tu pedido: ${estado}`,
    text: `Hola ${usuario.nombre || 'usuario'}, tu pedido con ID ${venta._id} ha sido ${estado}.`,
    html: `<p>Hola ${usuario.nombre || 'usuario'},</p><p>Tu pedido con ID <strong>${venta._id}</strong> ha sido <strong>${estado}</strong>.</p>`
  };  
  try {
    await sgMail.send(msg);
  } catch (emailError) {
    logger.error('Error enviando correo de cambio de estado:', emailError);
  }
  
}


    logger.info(`Estado de venta ${venta._id} actualizado a ${estado}`);
    res.json({ message: 'Estado actualizado', venta });
  } catch (error) {
    logger.error('Error actualizando estado venta:', error);
    res.status(500).json({ message: 'Error actualizando estado' });
  }
};

exports.topComprador = async (req, res) => {
  try {
    const resultado = await Venta.aggregate([
      { $group: { _id: "$usuarioId", totalGastado: { $sum: "$total" }, cantidadCompras: { $sum: 1 } } },
      { $sort: { totalGastado: -1 } },
      { $limit: 1 }
    ]);
    if (resultado.length === 0) return res.status(404).json({ message: 'No hay ventas registradas.' });
    res.json(resultado[0]);
  } catch (error) {
    logger.error('Error al obtener top comprador:', error);
    res.status(500).json({ message: 'Error al obtener top comprador' });
  }
};

exports.topCompradores = async (req, res) => {
  try {
    const resultado = await Venta.aggregate([
      { $group: { _id: "$usuarioId", totalGastado: { $sum: "$total" }, cantidadCompras: { $sum: 1 } } },
      { $sort: { totalGastado: -1 } },
      { $limit: 3 }
    ]);

    const ranking = await Promise.all(resultado.map(async (r) => {
      const usuario = await Usuario.findById(r._id);
      return {
        email: usuario ? usuario.email : 'Usuario eliminado',
        totalGastado: r.totalGastado,
        cantidadCompras: r.cantidadCompras
      };
    }));

    res.json(ranking);
  } catch (error) {
    logger.error('Error al obtener top compradores:', error);
    res.status(500).json([]);
  }
};
