const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

// Manejo de conexión
prisma.$connect()
  .then(() => {
    console.log('✅ Conectado a PostgreSQL');
  })
  .catch((error) => {
    console.error('❌ Error conectando a PostgreSQL:', error);
    process.exit(1);
  });

// Manejo graceful de desconexión
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = prisma;
