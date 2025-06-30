const mongoose = require('mongoose');
const Producto = require('../models/product');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('📦 Conectado a MongoDB'))
  .catch(err => console.error(err));

const descripciones = {
  "Hilo TUMI Ignacio": "Hilo de fibra natural con excelente resistencia y torsión firme, ideal para tejidos artesanales de alta calidad.",
  "Hilo Semigrueso": "Perfecto para mantas y tejidos decorativos, ofrece una textura suave y buena retención de color.",
  "Hilo ALPACRIL": "Hilo acrílico con acabado de alpaca, suave al tacto y colores intensos para todo tipo de tejidos.",
  "Ovillo": "Ovillos de fibras variadas en tonos naturales y vibrantes, pensados para trabajos de decoración y artesanía.",
  "Hilo de Alpaca Premium": "Exclusivo hilo de alpaca 100%, de alta calidad, ideal para prendas de lujo y tejidos finos.",
  "Tela de Aguayo Tradicional": "Tejido típico andino con diseños autóctonos y colores intensos, ideal para moda étnica y decoración.",
  "Retazos varios": "Paquetes surtidos de telas en distintos tamaños y colores para manualidades y detalles textiles.",
  "Hilo de Algodón para Tejer": "Hilo 100% algodón de excelente calidad para tejidos ligeros y prendas veraniegas.",
  "Cintas Elásticas para Costura": "Cintas resistentes y flexibles para cinturillas, dobladillos y proyectos de costura profesional.",
  "Tela de Aguayo": "Aguayo tradicional boliviano con múltiples colores para confección de mochilas, bolsos y decoración.",
  "Chalina de Alpaca": "Suaves chalinas de alpaca ideales para climas fríos, disponibles en colores sobrios y elegantes.",
  "Hilo de Llama": "Hilo grueso de fibra de llama, resistente y cálido, perfecto para tejidos rústicos y decorativos.",
  "Manta Paceña": "Mantas tejidas a mano con lana de llama y alpaca, reconocidas por su calidez y durabilidad.",
  "Cinta Bordada": "Cintas decoradas con bordados andinos para complementar prendas, accesorios y artículos de decoración.",
  "Gorro Andino": "Gorros típicos de los Andes, tejidos en lana natural con colores vibrantes y motivos tradicionales.",
  "Hilo Metálico Dorado": "Hilo brillante ideal para bordados de gala y detalles ornamentales en vestimenta tradicional.",
  "Poncho Infantil": "Ponchos tejidos para niños con diseños coloridos y telas suaves que garantizan abrigo.",
  "Chalina de Baby Alpaca": "Chalinas elaboradas con fibra de baby alpaca, extremadamente suaves y livianas.",
  "Hilo Brillante para Bordar": "Hilo metálico de alta resistencia para bordados decorativos y textiles festivos."
};

async function actualizarDescripciones() {
  try {
    for (const [nombre, descripcion] of Object.entries(descripciones)) {
      const res = await Producto.findOneAndUpdate(
        { nombre },
        { descripcion },
        { new: true }
      );
      if (res) {
        console.log(`✅ Descripción actualizada para ${nombre}`);
      } else {
        console.log(`⚠️ Producto no encontrado: ${nombre}`);
      }
    }
    mongoose.disconnect();
    console.log('✅ Actualización completada');
  } catch (err) {
    console.error('❌ Error:', err);
    mongoose.disconnect();
  }
}

actualizarDescripciones();
