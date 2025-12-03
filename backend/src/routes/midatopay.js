const express = require('express');
const MidatoPayService = require('../services/midatopayService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const midatoPayService = new MidatoPayService();

// Generar QR de pago
router.post('/generate-qr', authenticateToken, async (req, res) => {
  try {
    const { amountARS, targetCrypto, concept, network } = req.body;
    const merchantId = req.user.id; // Asumiendo que auth middleware agrega user info

    if (!amountARS || !targetCrypto) {
      return res.status(400).json({
        success: false,
        error: 'amountARS and targetCrypto are required'
      });
    }

    if (amountARS <= 0) {
      return res.status(400).json({
        success: false,
        error: 'amountARS must be greater than 0'
      });
    }

    const supportedCryptos = ['USDC'];
    if (!supportedCryptos.includes(targetCrypto)) {
      return res.status(400).json({
        success: false,
        error: `targetCrypto must be one of: ${supportedCryptos.join(', ')}`
      });
    }

    // Validar red (polygon por defecto)
    const supportedNetworks = ['polygon', 'optimism'];
    const selectedNetwork = (network || 'polygon').toLowerCase();
    if (!supportedNetworks.includes(selectedNetwork)) {
      return res.status(400).json({
        success: false,
        error: `network must be one of: ${supportedNetworks.join(', ')}`
      });
    }

    const result = await midatoPayService.generatePaymentQR(merchantId, amountARS, concept, selectedNetwork);
    
    res.json(result);
  } catch (error) {
    console.error('Error generating QR:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Procesar pago ARS confirmado
router.post('/process-payment', async (req, res) => {
  try {
    const { sessionId, arsPaymentData } = req.body;

    if (!sessionId || !arsPaymentData) {
      return res.status(400).json({
        success: false,
        error: 'sessionId and arsPaymentData are required'
      });
    }

    if (!arsPaymentData.amount || arsPaymentData.amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'arsPaymentData.amount must be greater than 0'
      });
    }

    const result = await midatoPayService.processARSPayment(sessionId, arsPaymentData);
    
    res.json(result);
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Escanear QR
router.post('/scan-qr', async (req, res) => {
  try {
    const { qrData } = req.body;
    
    console.log('🔍 QR Scan request received:', qrData);

    if (!qrData) {
      return res.status(400).json({
        success: false,
        error: 'qrData is required'
      });
    }

    const result = await midatoPayService.scanPaymentQR(qrData);
    
    console.log('✅ QR Scan result:', result);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error scanning QR:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Obtener historial de pagos del comercio
router.get('/payment-history', authenticateToken, async (req, res) => {
  try {
    const merchantId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;

    const history = await midatoPayService.getMerchantPaymentHistory(merchantId, limit);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Obtener estadísticas del comercio
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const merchantId = req.user.id;

    const stats = await midatoPayService.getMerchantStats(merchantId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting merchant stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DEBUG: Ver todos los pagos en la base de datos
router.get('/debug/payments', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const payments = await prisma.payment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    });
    
    console.log('🔍 DEBUG - Todos los pagos en BD:', payments);
    
    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error getting debug payments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// Webhook para confirmación de pagos ARS (desde bancos/transferencias)
router.post('/webhook/ars-payment', async (req, res) => {
  try {
    const { sessionId, amount, transactionId, bankReference } = req.body;

    if (!sessionId || !amount || !transactionId) {
      return res.status(400).json({
        success: false,
        error: 'sessionId, amount, and transactionId are required'
      });
    }

    // Procesar pago ARS automáticamente
    const arsPaymentData = {
      amount,
      transactionId,
      bankReference,
      timestamp: new Date()
    };

    const result = await midatoPayService.processARSPayment(sessionId, arsPaymentData);
    
    res.json(result);
  } catch (error) {
    console.error('Error processing webhook payment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MidatoPay service is running',
    timestamp: new Date()
  });
});

module.exports = router;
