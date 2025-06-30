const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const AlmacenTemp = require('../models/almacen_temp');
const Catalogo = require('../models/catalogo');
const Gasto = require('../models/gasto');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se ha subido ningún archivo' });

    const workbook = xlsx.readFile(req.file.path);

    // 📌 Procesar productos desde BD VENTAS
    const ventasSheet = workbook.Sheets['BD VENTAS'];
    const ventasData = xlsx.utils.sheet_to_json(ventasSheet);

    await Catalogo.deleteMany();

    const productosUnicos = [];
    ventasData.forEach(item => {
      if (item.Producto && item.Precio !== undefined) {
        if (!productosUnicos.some(p => p.producto === item.Producto)) {
          productosUnicos.push({
            producto: item.Producto,
            color: item.Color || 'N/A',
            cantidad: item.Cantidad || 0,
            precio: item.Precio
          });
        }
      }
    });

    await Catalogo.insertMany(productosUnicos);
    await AlmacenTemp.create({ data: ventasData });

    // 📌 Procesar gastos desde BD GASTOS
    const gastosSheet = workbook.Sheets['BD GASTOS'];
    const gastosData = xlsx.utils.sheet_to_json(gastosSheet);

    console.log('📋 Gastos leídos desde Excel:', gastosData);

    for (const item of gastosData) {
      // Saltar encabezado o registros inválidos
      if (item['__EMPTY_2'] === 'GASTO' || !item['__EMPTY_3'] || isNaN(Number(item['__EMPTY_3']))) continue;

      let fechaGasto = new Date();
      if (item['__EMPTY']) {
        if (typeof item['__EMPTY'] === 'number') {
          fechaGasto = new Date(Math.round((item['__EMPTY'] - 25569) * 86400 * 1000));
        } else if (!isNaN(new Date(item['__EMPTY']).getTime())) {
          fechaGasto = new Date(item['__EMPTY']);
        }
      }

      await Gasto.create({
        monto: Number(item['__EMPTY_3']),
        descripcion: item['__EMPTY_2'],
        fecha: fechaGasto
      });
    }

    fs.unlinkSync(req.file.path);

    res.json({ message: 'Datos de productos y gastos cargados correctamente.' });

  } catch (error) {
    console.error('Error al procesar el archivo:', error);
    res.status(500).json({ message: 'Error al procesar el archivo' });
  }
});

module.exports = router;
