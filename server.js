const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { generalLimiter } = require('./middlewares/rateLimitMiddleware');
const connectDB = require('./config/db');
const { OpenAI } = require('openai');
const logger = require('./config/logger');

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  logger.error('Falta la clave de OpenAI');
  process.exit(1);
}

connectDB();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();

app.disable('x-powered-by');

app.use(morgan('dev'));

// ✅ CORS para localhost:3000 o variable de entorno
app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' }));

// ✅ Helmet solo en producción — con crossOriginEmbedderPolicy: false para evitar conflictos
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'http://localhost:3000', 'http://localhost:5000', 'https://res.cloudinary.com'],
        connectSrc: ["'self'", 'http://localhost:3000', process.env.CLIENT_URL, 'https://openrouter.ai'],
        objectSrc: ["'none'"]
      },
    },
    crossOriginEmbedderPolicy: false
  }));
}

app.use(generalLimiter);

// ✅ Servir carpeta de imágenes locales
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Endpoint de salud
app.get('/api/status', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rutas
app.use('/api/productos', require('./routes/products'));
app.use('/api/admin/productos', require('./routes/catalogo'));
app.use('/api/catalogo', require('./routes/catalogo'));
app.use('/api/procesar', require('./routes/procesarAlmacenTemp'));
app.use('/api/procesar/migrar', require('./routes/productRoutes'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/gpt', require('./routes/gpt'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/almacen_temp', require('./routes/almacen_temp'));
app.use('/api/carrito', require('./routes/carrito'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/ventas', require('./routes/ventas'));
app.use('/api/gastos', require('./routes/gastos'));
app.use('/api/reset-password', require('./routes/resetPassword'));
app.use('/api/logs', require('./routes/auditLogs'));

app.get('/', (req, res) => res.send('API funcionando correctamente'));

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Servidor corriendo correctamente en puerto ${PORT}`);
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
