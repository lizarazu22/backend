const xlsx = require('xlsx');
const fs = require('fs');
const Gasto = require('../models/gasto');

exports.procesarGastosDesdeExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se ha subido ningún archivo' });

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets['BD GASTOS'];
    if (!sheet) return res.status(400).json({ message: 'La hoja BD GASTOS no existe en el Excel' });

    const data = xlsx.utils.sheet_to_json(sheet);

    const gastos = data.map(item => ({
      descripcion: item.GASTO || 'Sin descripción',
      monto: Number(item.MONTO) || 0,
      fecha: item.FECHA ? new Date(item.FECHA) : new Date()
    }));

    await Gasto.insertMany(gastos);

    fs.unlinkSync(req.file.path);

    res.json({ message: 'Gastos cargados correctamente desde Excel', total: gastos.length });
  } catch (error) {
    console.error('Error al procesar gastos desde Excel:', error);
    res.status(500).json({ message: 'Error al procesar gastos', error });
  }
};
