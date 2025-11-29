const express = require('express');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { getCurrentPrice } = require('../services/priceOracle');

const router = express.Router();

// Crear nuevo pago
router.post('/create', authenticateToken, [
  body('amount').isFloat({ min: 0.01 }),
  body('concept').trim().isLength({ min: 1, max: 100 }),
  body('orderId').optional().trim().isLength({ max: 50 }),
  body('currency').optional().isIn(['ARS', 'USD'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Por favor, verifica los datos ingresados',
        details: errors.array()
      });
    }

    const { amount, concept, orderId, currency = 'ARS' } = req.body;

    // Generar QR único
    const qrId = uuidv4();
    const qrData = {
      id: qrId,
      amount: parseFloat(amount),
      concept,
      orderId,
      currency,
      merchantId: req.user.id,
      timestamp: new Date().toISOString()
    };

    // URL para el QR (redirige a la página de pago)
    const paymentUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pay/${qrId}`;

    // Generar código QR con URL de pago
    const qrCodeUrl = await QRCode.toDataURL(paymentUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Crear pago en la base de datos
    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        currency,
        concept,
        orderId,
        qrCode: qrId,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
        userId: req.user.id
      }
    });

    res.status(201).json({
      message: 'Pago creado exitosamente',
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        concept: payment.concept,
        orderId: payment.orderId,
        qrCode: qrCodeUrl,
        expiresAt: payment.expiresAt,
        status: payment.status
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obtener información del pago desde QR
router.get('/qr/:qrId', async (req, res, next) => {
  try {
    const { qrId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { qrCode: qrId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        error: 'Pago no encontrado',
        message: 'El código QR no es válido o ha expirado',
        code: 'PAYMENT_NOT_FOUND'
      });
    }

    // Verificar si el pago ha expirado
    if (new Date() > payment.expiresAt) {
      return res.status(410).json({
        error: 'Pago expirado',
        message: 'Este pago ha expirado',
        code: 'PAYMENT_EXPIRED'
      });
    }

    // Verificar si ya fue pagado
    if (payment.status === 'PAID') {
      return res.status(409).json({
        error: 'Pago ya realizado',
        message: 'Este pago ya fue procesado',
        code: 'PAYMENT_ALREADY_PAID'
      });
    }

    // Obtener precios actuales para mostrar opciones
    const usdcPrice = await getCurrentPrice('USDC', 'ARS');
    const btcPrice = await getCurrentPrice('BTC', 'ARS');
    const ethPrice = await getCurrentPrice('ETH', 'ARS');

    const paymentOptions = [
      {
        currency: 'ARS',
        amount: payment.amount,
        rate: 1,
        source: 'Directo'
      }
    ];

    if (usdcPrice) {
      paymentOptions.push({
        currency: 'USDC',
        amount: (payment.amount / usdcPrice.price).toFixed(6),
        rate: usdcPrice.price,
        source: usdcPrice.source,
        validFor: 30 // segundos
      });
    }

    if (btcPrice) {
      paymentOptions.push({
        currency: 'BTC',
        amount: (payment.amount / btcPrice.price).toFixed(8),
        rate: btcPrice.price,
        source: btcPrice.source,
        validFor: 30
      });
    }

    if (ethPrice) {
      paymentOptions.push({
        currency: 'ETH',
        amount: (payment.amount / ethPrice.price).toFixed(6),
        rate: ethPrice.price,
        source: ethPrice.source,
        validFor: 30
      });
    }

    res.json({
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        concept: payment.concept,
        orderId: payment.orderId,
        merchant: {
          name: payment.user.name,
          email: payment.user.email
        },
        expiresAt: payment.expiresAt,
        status: payment.status
      },
      paymentOptions
    });
  } catch (error) {
    next(error);
  }
});

// Obtener pagos del usuario autenticado
router.get('/my-payments', authenticateToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId: req.user.id };
    if (status) {
      where.status = status;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          transactions: {
            select: {
              id: true,
              amount: true,
              currency: true,
              status: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.payment.count({ where })
    ]);

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obtener detalles de un pago específico
router.get('/:paymentId', authenticateToken, async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId: req.user.id
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        error: 'Pago no encontrado',
        message: 'No se encontró el pago solicitado',
        code: 'PAYMENT_NOT_FOUND'
      });
    }

    res.json({ payment });
  } catch (error) {
    next(error);
  }
});

// Cancelar un pago
router.put('/:paymentId/cancel', authenticateToken, async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId: req.user.id,
        status: 'PENDING'
      }
    });

    if (!payment) {
      return res.status(404).json({
        error: 'Pago no encontrado',
        message: 'No se encontró el pago o ya no está pendiente',
        code: 'PAYMENT_NOT_FOUND'
      });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'CANCELLED' }
    });

    res.json({
      message: 'Pago cancelado exitosamente',
      payment: updatedPayment
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
