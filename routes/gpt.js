const express = require('express');
const router = express.Router();
const openai = require('../config/openai');
const Producto = require('../models/product');

router.post('/buscar', async (req, res) => {
  const { solicitud } = req.body;

  if (!solicitud) {
    return res.status(400).json({ message: 'La solicitud es requerida' });
  }

  try {
    // Solo productos con stock disponible
    const productos = await Producto.find({ stock: { $gt: 0 } }, 'nombre descripcion categoria material precio stock');

    if (!productos.length) {
      return res.status(404).json({ message: 'No hay productos en stock en el catálogo' });
    }

    const prompt = `
Eres un asistente experto en ventas. Tienes este catálogo de productos:
${JSON.stringify(productos)}.

Cuando recibas una solicitud, responde estrictamente en JSON con este formato:

{
  "recomendados": [
    { "nombre": "Nombre producto", "precio": 100, "categoria": "Categoría" }
  ]
}

Incluye solo los productos más relevantes relacionados a la solicitud.

Solicitud del cliente: "${solicitud}"
`;

    const response = await openai.post('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Responde solo en JSON válido.' },
        { role: 'user', content: prompt },
      ],
    });

    const raw = response.data.choices[0].message.content.trim();

    let sugerencias;
    try {
      sugerencias = JSON.parse(raw);
    } catch (err) {
      console.error('Error parseando JSON IA:', err);
      return res.status(500).json({ message: 'Respuesta inválida desde IA', raw });
    }

    res.status(200).json({
      message: 'Productos sugeridos',
      sugerencias,
    });

  } catch (error) {
    console.error('Error al interactuar con OpenAI:', error.message);
    res.status(500).json({ message: 'Error al procesar la solicitud con OpenAI' });
  }
});

module.exports = router;
