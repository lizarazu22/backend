const express = require('express');
const router = express.Router();
const AuditLog = require('../models/auditLog');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkAdmin } = require('../middlewares/roleMiddleware');

// Solo para admins autenticados
router.get('/', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ fecha: -1 });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener logs' });
  }
});

module.exports = router;
