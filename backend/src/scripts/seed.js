const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuario administrador
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@midatopay.com' },
    update: {},
    create: {
      email: 'admin@midatopay.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'ADMIN',
      isActive: true
    }
  });

  console.log('✅ Usuario administrador creado:', admin.email);

  // Crear usuario comercio de ejemplo
  const merchantPassword = await bcrypt.hash('merchant123', 12);
  const merchant = await prisma.user.upsert({
    where: { email: 'barista@cafe.com' },
    update: {},
    create: {
      email: 'barista@cafe.com',
      password: merchantPassword,
      name: 'Cafe del Barrio',
      phone: '+5491123456789',
      role: 'MERCHANT',
      isActive: true
    }
  });

  console.log('✅ Usuario comercio creado:', merchant.email);

  // Crear precios de ejemplo - Oracle de Polygon
  const prices = [
    {
      currency: 'USDC',
      baseCurrency: 'ARS',
      price: 375.50,
      source: 'POLYGON_ORACLE'
    }
  ];

  for (const price of prices) {
    await prisma.priceOracle.create({
      data: price
    });
  }

  console.log('✅ Precios de ejemplo creados');

  // Crear pago de ejemplo
  const examplePayment = await prisma.payment.create({
    data: {
      amount: 2000,
      currency: 'ARS',
      concept: 'Café',
      orderId: 'ORD-001',
      qrCode: 'example-qr-123',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
      userId: merchant.id
    }
  });

  console.log('✅ Pago de ejemplo creado:', examplePayment.id);

  console.log('🎉 Seed completado exitosamente!');
  console.log('\n📋 Usuarios creados:');
  console.log('👤 Admin: admin@midatopay.com / admin123');
  console.log('🏪 Comercio: barista@cafe.com / merchant123');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
