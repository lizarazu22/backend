const mongoose = require('mongoose');

const almacenTempSchema = new mongoose.Schema({
  data: { type: Array, required: true },
  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AlmacenTemp', almacenTempSchema);
