const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Usuario = require('../models/user');
const { resetPasswordLimiter } = require('../middlewares/rateLimitMiddleware');

// Configurar Nodemailer con SendGrid SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
  logger: true,
  debug: true
});

// Enviar correo de recuperación (limitado)
router.post('/forgot-password', resetPasswordLimiter, async (req, res) => {
  const { email } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${usuario._id}/${token}`;

    await transporter.sendMail({
      from: '"Tienda Textil" <ignaciolizarazu00@gmail.com>',
      to: usuario.email,
      subject: 'Restablecer contraseña',
      html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><a href="${resetLink}">${resetLink}</a>`,
    });

    res.status(200).json({ message: 'Correo de restablecimiento enviado' });
  } catch (error) {
    console.error('Error al enviar correo de restablecimiento:', error);
    res.status(500).json({ message: 'Error al enviar correo de restablecimiento', error });
  }
});

// Restablecer contraseña (sin límite, pero con JWT seguro)
router.post('/reset-password/:id/:token', async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.id !== id) {
      return res.status(400).json({ message: 'Token inválido' });
    }

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    usuario.password = password; // ⚠️ idealmente deberías hashearlo (lo vemos después)
    await usuario.save();

    res.status(200).json({ message: 'Contraseña restablecida correctamente' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ message: 'Error al restablecer contraseña', error });
  }
});

module.exports = router;
