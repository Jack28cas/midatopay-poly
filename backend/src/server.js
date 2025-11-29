const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payments');
const transactionRoutes = require('./routes/transactions');
const oracleRoutes = require('./routes/oracle');
const waitlistRoutes = require('./routes/waitlist');
const midatoPayRoutes = require('./routes/midatopay');
const walletRoutes = require('./routes/wallet');
const statsRoutes = require('./routes/stats');
const faqRoutes = require('./routes/faq');
const webhookRoutes = require('./routes/webhooks');
const { errorHandler } = require('./middleware/errorHandler');
const { initializeWebSocket } = require('./services/websocket');
const { startPriceOracle } = require('./services/priceOracle');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy (necesario cuando está detrás de Nginx/reverse proxy)
// En producción, configurar con el número específico de proxies
// En desarrollo, desactivar para evitar problemas con rate limiting
if (process.env.NODE_ENV === 'production') {
  // En producción, confiar solo en el primer proxy (Nginx)
  app.set('trust proxy', 1);
} else {
  // En desarrollo, no confiar en proxies
  app.set('trust proxy', false);
}

// Middleware de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://midatopay.com'] 
    : [
        'http://localhost:3000',
        /^https:\/\/.*\.ngrok\.io$/,
        /^https:\/\/.*\.ngrok-free\.app$/
      ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/oracle', oracleRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/midatopay', midatoPayRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/webhooks', webhookRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl 
  });
});

// Inicializar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

// Inicializar WebSocket
initializeWebSocket(server);

// Inicializar oráculo de precios
startPriceOracle();

// Manejo graceful de cierre
process.on('SIGTERM', () => {
  console.log('🛑 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

module.exports = app;
