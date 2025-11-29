const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { getCurrentPrice } = require('../services/priceOracle');
const { simulateBlockchainTransaction } = require('../services/blockchain');

const router = express.Router();

// Crear nueva transacción (iniciar pago)
router.post('/create', [
  body('paymentId').isLength({ min: 1 }),
  body('currency').isIn(['ARS', 'USDT', 'BTC', 'ETH']),
  body('amount').isFloat({ min: 0.000001 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Error de validación:', errors.array());
      console.log('📝 Datos recibidos:', req.body);
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Por favor, verifica los datos ingresados',
        details: errors.array()
      });
    }

    const { paymentId, currency, amount } = req.body;

    // Verificar que el pago existe y está pendiente
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true }
    });

    if (!payment) {
      return res.status(404).json({
        error: 'Pago no encontrado',
        message: 'El pago especificado no existe',
        code: 'PAYMENT_NOT_FOUND'
      });
    }

    if (payment.status !== 'PENDING') {
      return res.status(409).json({
        error: 'Pago no disponible',
        message: 'Este pago ya no está disponible',
        code: 'PAYMENT_NOT_AVAILABLE'
      });
    }

    if (new Date() > payment.expiresAt) {
      return res.status(410).json({
        error: 'Pago expirado',
        message: 'Este pago ha expirado',
        code: 'PAYMENT_EXPIRED'
      });
    }

    // Obtener precio actual (solo para criptomonedas)
    let exchangeRate = 1;
    let finalAmount = parseFloat(amount);
    
    if (currency !== 'ARS') {
      const priceData = await getCurrentPrice(currency, 'ARS');
      exchangeRate = priceData.price;
      finalAmount = parseFloat(amount) * exchangeRate;
    }

    // Crear transacción
    const transaction = await prisma.transaction.create({
      data: {
        paymentId,
        amount: parseFloat(amount),
        currency,
        exchangeRate,
        finalAmount,
        finalCurrency: 'ARS',
        status: 'PENDING',
        walletAddress: generateWalletAddress(currency),
        userId: payment.userId
      }
    });

    res.status(201).json({
      message: 'Transacción creada exitosamente',
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        exchangeRate: transaction.exchangeRate,
        finalAmount: transaction.finalAmount,
        finalCurrency: transaction.finalCurrency,
        walletAddress: transaction.walletAddress,
        status: transaction.status,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
      }
    });
  } catch (error) {
    next(error);
  }
});

// Confirmar pago (simular recepción de transacción blockchain)
router.post('/:transactionId/confirm', async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const { txHash } = req.body;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        payment: {
          include: { user: true }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({
        error: 'Transacción no encontrada',
        message: 'La transacción especificada no existe',
        code: 'TRANSACTION_NOT_FOUND'
      });
    }

    if (transaction.status !== 'PENDING') {
      return res.status(409).json({
        error: 'Transacción no disponible',
        message: 'Esta transacción ya fue procesada',
        code: 'TRANSACTION_NOT_AVAILABLE'
      });
    }

    // Simular verificación de transacción blockchain
    const blockchainResult = await simulateBlockchainTransaction(txHash, transaction);

    if (!blockchainResult.confirmed) {
      return res.status(400).json({
        error: 'Transacción no confirmada',
        message: 'La transacción blockchain no pudo ser verificada',
        code: 'BLOCKCHAIN_NOT_CONFIRMED'
      });
    }

    // Actualizar transacción
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'CONFIRMED',
        blockchainTxHash: txHash,
        confirmationCount: blockchainResult.confirmations
      }
    });

    // Actualizar pago
    await prisma.payment.update({
      where: { id: transaction.paymentId },
      data: { status: 'PAID' }
    });

    // Simular conversión y liquidación
    await simulateLiquidation(transaction);

    res.json({
      message: 'Pago confirmado exitosamente',
      transaction: {
        id: updatedTransaction.id,
        status: updatedTransaction.status,
        blockchainTxHash: updatedTransaction.blockchainTxHash,
        confirmationCount: updatedTransaction.confirmationCount
      },
      payment: {
        id: transaction.payment.id,
        status: 'PAID',
        finalAmount: transaction.finalAmount,
        finalCurrency: transaction.finalCurrency
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obtener transacciones del usuario autenticado (DEBE estar ANTES de /:transactionId)
router.get('/my-transactions', authenticateToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId: req.user.id };
    if (status) {
      where.status = status;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          payment: {
            select: {
              id: true,
              amount: true,
              currency: true,
              concept: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.transaction.count({ where })
    ]);

    res.json({
      transactions,
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

// Obtener datos completos de una transacción
router.get('/:transactionId', async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        payment: {
          select: {
            id: true,
            amount: true,
            currency: true,
            concept: true,
            status: true,
            orderId: true
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transacción no encontrada',
        message: 'La transacción especificada no existe',
        code: 'TRANSACTION_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      transaction: {
        id: transaction.id,
        paymentId: transaction.payment.orderId,
        amount: parseFloat(transaction.amount),
        currency: transaction.currency,
        exchangeRate: parseFloat(transaction.exchangeRate),
        finalAmount: parseFloat(transaction.finalAmount),
        finalCurrency: transaction.finalCurrency,
        status: transaction.status,
        blockchainTxHash: transaction.blockchainTxHash,
        confirmationCount: transaction.confirmationCount,
        requiredConfirmations: transaction.requiredConfirmations,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt
      },
      mode: transaction.blockchainTxHash ? 'REAL' : 'SIMULATION'
    });
  } catch (error) {
    next(error);
  }
});

// Obtener estado de una transacción
router.get('/:transactionId/status', async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        payment: {
          select: {
            id: true,
            amount: true,
            currency: true,
            concept: true,
            status: true
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({
        error: 'Transacción no encontrada',
        message: 'La transacción especificada no existe',
        code: 'TRANSACTION_NOT_FOUND'
      });
    }

    res.json({
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        exchangeRate: transaction.exchangeRate,
        finalAmount: transaction.finalAmount,
        finalCurrency: transaction.finalCurrency,
        status: transaction.status,
        blockchainTxHash: transaction.blockchainTxHash,
        confirmationCount: transaction.confirmationCount,
        requiredConfirmations: transaction.requiredConfirmations,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt
      },
      payment: transaction.payment
    });
  } catch (error) {
    next(error);
  }
});

// Función auxiliar para generar dirección de wallet
function generateWalletAddress(currency) {
  // Para el MVP, generamos direcciones simuladas
  const prefixes = {
    'ARS': 'ARS',
    'USDT': 'T',
    'BTC': '1',
    'ETH': '0x'
  };
  
  const prefix = prefixes[currency] || '0x';
  const randomPart = Math.random().toString(36).substring(2, 15);
  
  return `${prefix}${randomPart}${Math.random().toString(36).substring(2, 15)}`;
}

// Función auxiliar para simular liquidación
async function simulateLiquidation(transaction) {
  // Simular delay de conversión
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log(`💰 Liquidación simulada: ${transaction.finalAmount} ${transaction.finalCurrency} para el comercio`);
  
  // En producción, aquí se haría la conversión real y transferencia bancaria
  return true;
}

module.exports = router;
