const express = require('express');
const router = express.Router();
const priceOracle = require('../services/priceOracle');

// Endpoint para obtener cotización ARS → USDT del Oracle
router.get('/quote/:amount', async (req, res) => {
  try {
    const amountARS = parseFloat(req.params.amount);
    
    if (isNaN(amountARS) || amountARS <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive number'
      });
    }

    console.log(`🔍 Obteniendo cotización para ${amountARS} ARS...`);
    
    const conversion = await priceOracle.convertARSToCrypto(amountARS, 'USDC');
    
    res.json({
      success: true,
      data: {
        amountARS,
        targetCrypto: 'USDC',
        cryptoAmount: conversion.cryptoAmount,
        exchangeRate: conversion.exchangeRate,
        source: conversion.source,
        timestamp: conversion.timestamp,
        oracleAddress: conversion.oracleAddress || null,
        cryptoAmountWithMargin: conversion.cryptoAmountWithMargin
      }
    });
  } catch (error) {
    console.error('Error obteniendo cotización:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para obtener el rate actual del Oracle
router.get('/rate', async (req, res) => {
  try {
    console.log('🔍 Obteniendo rate actual del Oracle...');
    
    const priceData = await priceOracle.getCurrentPrice('USDC', 'ARS');
    
    res.json({
      success: true,
      data: {
        rate: priceData.price,
        source: priceData.source,
        timestamp: priceData.timestamp,
        oracleAddress: priceData.oracleAddress || null,
        usdtAmount: priceData.usdtAmount || null
      }
    });
  } catch (error) {
    console.error('Error obteniendo rate:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para verificar estado del Oracle
router.get('/status', async (req, res) => {
  try {
    console.log('🔍 Verificando estado del Oracle...');
    
    const status = await priceOracle.getOracleStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error verificando estado del Oracle:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para obtener balance USDT de una cuenta
router.get('/balance/:address', async (req, res) => {
  try {
    const accountAddress = req.params.address;
    
    if (!accountAddress || accountAddress.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Invalid account address'
      });
    }

    console.log(`🔍 Obteniendo balance USDT para ${accountAddress}...`);
    
    const balance = await priceOracle.getUSDTBalance(accountAddress);
    
    res.json({
      success: true,
      data: balance
    });
  } catch (error) {
    console.error('Error obteniendo balance USDT:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para probar el Oracle con diferentes montos
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Probando Oracle con diferentes montos...');
    
    const testAmounts = [1, 10, 100, 1000, 10000];
    const results = [];
    
    for (const amount of testAmounts) {
      try {
        const conversion = await priceOracle.convertARSToCrypto(amount, 'USDC');
        results.push({
          amountARS: amount,
          usdtAmount: conversion.cryptoAmount,
          rate: conversion.exchangeRate,
          source: conversion.source,
          success: true
        });
      } catch (error) {
        results.push({
          amountARS: amount,
          error: error.message,
          success: false
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        testResults: results,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error probando Oracle:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;