const mongoose = require('mongoose');

const gastoSchema = new mongoose.Schema({
  monto: { type: Number, required: true },
  descripcion: { type: String, required: true },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gasto', gastoSchema);
