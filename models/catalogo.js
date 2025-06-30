const mongoose = require('mongoose');

const catalogoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  color: { type: String, default: 'Sin color' },
  stock: { type: Number, default: 0 },
  precio: { type: Number, default: 0 }
});

module.exports = mongoose.model('Catalogo', catalogoSchema);
