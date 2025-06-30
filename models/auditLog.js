const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  accion: { type: String, required: true },
  recurso: { type: String, required: true },
  recursoId: { type: String },
  admin: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    nombre: String,
    email: String
  },
  datosPrevios: { type: Object },
  datosNuevos: { type: Object },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
