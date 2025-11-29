const prisma = require('../config/database');
const cron = require('node-cron');
const PolygonOracleService = require('./polygonOracleService');

// Cache de precios en memoria (para MVP)
const priceCache = new Map();
const CACHE_DURATION = 30 * 1000; // 30 segundos

// Instancia del servicio Oracle de Polygon
const polygonOracle = new PolygonOracleService();

async function getCurrentPrice(currency, baseCurrency = 'ARS') {
  const cacheKey = `${currency}_${baseCurrency}`;
  const cached = priceCache.get(cacheKey);
  
  // Verificar cache
  if (cached && (Date.now() - cached.timestamp.getTime()) < CACHE_DURATION) {
    return cached;
  }

  // 🚀 ORACLE DE POLYGON para USDC/ARS
  if ((currency === 'USDC' || currency === 'USDT') && baseCurrency === 'ARS') {
    console.log('🔍 Obteniendo precio USDC/ARS del Oracle de Polygon...');
    
    // Usar 1 ARS como base para obtener el rate
    const quoteResult = await polygonOracle.getARSToUSDTQuote(1);
    
    // Solo guardar si el rate es válido (no 0, no Infinity, no NaN)
    if (quoteResult.rate > 0 && isFinite(quoteResult.rate)) {
      const oraclePrice = {
        price: quoteResult.rate,
        source: 'POLYGON_ORACLE',
        timestamp: new Date(),
        oracleAddress: polygonOracle.oracleAddress,
        usdtAmount: quoteResult.usdtAmount,
        rate: quoteResult.rate
      };
      
      // Actualizar cache
      priceCache.set(cacheKey, oraclePrice);
      
      // Guardar en base de datos
      try {
        await prisma.priceOracle.create({
          data: {
            currency,
            baseCurrency,
            price: oraclePrice.price,
            source: oraclePrice.source
          }
        });
        console.log(`✅ Precio USDC/ARS guardado en BD: $${oraclePrice.price}`);
      } catch (error) {
        console.warn('Error guardando precio del Oracle en BD:', error.message);
      }
      
      console.log(`✅ Precio USDC/ARS obtenido del Oracle: $${oraclePrice.price}`);
      return oraclePrice;
    } else {
      console.warn(`⚠️ Rate inválido del Oracle: ${quoteResult.rate}, no se guarda en BD`);
      // Devolver un precio por defecto para evitar errores
      return {
        price: 1000, // Precio por defecto: 1 USDC = 1000 ARS
        source: 'DEFAULT',
        timestamp: new Date()
      };
    }
  }
  
  // Para otras monedas, no soportadas - solo USDC/ARS
  throw new Error(`Solo se soporta USDC/ARS a través del Oracle de Polygon. Solicitado: ${currency}/${baseCurrency}`);
}

// Función para actualizar precios periódicamente - ORACLE DE POLYGON
async function updatePrices() {
  console.log('🔄 Actualizando precios...');
  
  // Solo actualizar USDC usando Oracle de Polygon
  try {
    const priceData = await getCurrentPrice('USDC', 'ARS');
    console.log(`✅ Precio USDC/ARS actualizado: $${priceData.price} (${priceData.source})`);
  } catch (error) {
    console.error(`❌ Error actualizando USDC/ARS:`, error.message);
  }
}

// Iniciar actualización automática de precios
function startPriceOracle() {
  console.log('🚀 Iniciando oráculo de precios (Polygon)...');
  
  // Actualizar precios cada 30 segundos
  cron.schedule('*/30 * * * * *', updatePrices);
  
  // Actualizar precios al inicio
  updatePrices();
  
  console.log('✅ Oráculo de precios iniciado');
}

// Función para obtener historial de precios
async function getPriceHistory(currency, baseCurrency = 'ARS', hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  const prices = await prisma.priceOracle.findMany({
    where: {
      currency,
      baseCurrency,
      timestamp: {
        gte: since
      }
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: 100
  });

  return prices;
}

// Función específica para conversión ARS → Crypto (MidatoPay) - ORACLE DE POLYGON
async function convertARSToCrypto(amountARS, targetCrypto) {
  try {
    // 🚀 ORACLE DE POLYGON para USDC
    if (targetCrypto === 'USDC') {
      console.log(`🔍 Convirtiendo ${amountARS} ARS a USDC usando Oracle de Polygon...`);
      
      const quoteResult = await polygonOracle.getARSToUSDTQuote(amountARS);
      
      return {
        amountARS,
        targetCrypto,
        cryptoAmount: quoteResult.usdtAmount,
        exchangeRate: quoteResult.rate,
        source: 'POLYGON_ORACLE',
        timestamp: quoteResult.timestamp,
        oracleAddress: polygonOracle.oracleAddress,
        // Agregar margen de seguridad del 2%
        cryptoAmountWithMargin: quoteResult.usdtAmount * 0.98
      };
    }
    
    // Para otras criptomonedas, no soportadas
    throw new Error(`Solo se soporta conversión a USDC a través del Oracle de Polygon. Solicitado: ${targetCrypto}`);
  } catch (error) {
    console.error(`Error convirtiendo ${amountARS} ARS a ${targetCrypto}:`, error.message);
    throw error;
  }
}

// Función para obtener rate con margen de seguridad - ORACLE DE POLYGON
async function getExchangeRateWithMargin(targetCrypto, marginPercent = 2) {
  try {
    // Solo soportamos USDC
    if (targetCrypto !== 'USDC') {
      throw new Error(`Solo se soporta USDC a través del Oracle de Polygon. Solicitado: ${targetCrypto}`);
    }
    
    const priceData = await getCurrentPrice(targetCrypto, 'ARS');
    const margin = marginPercent / 100;
    
    return {
      baseRate: priceData.price,
      rateWithMargin: priceData.price * (1 + margin),
      marginPercent,
      targetCrypto,
      source: priceData.source,
      timestamp: priceData.timestamp
    };
  } catch (error) {
    console.error(`Error obteniendo rate con margen para ${targetCrypto}:`, error.message);
    throw error;
  }
}

// Función para validar si un rate está dentro del rango aceptable - ORACLE DE POLYGON
async function validateExchangeRate(targetCrypto, expectedRate, tolerancePercent = 5) {
  try {
    // Solo soportamos USDC
    if (targetCrypto !== 'USDC') {
      throw new Error(`Solo se soporta USDC a través del Oracle de Polygon. Solicitado: ${targetCrypto}`);
    }
    
    const currentRate = await getCurrentPrice(targetCrypto, 'ARS');
    const tolerance = tolerancePercent / 100;
    const minRate = expectedRate * (1 - tolerance);
    const maxRate = expectedRate * (1 + tolerance);
    
    const isValid = currentRate.price >= minRate && currentRate.price <= maxRate;
    
    return {
      isValid,
      currentRate: currentRate.price,
      expectedRate,
      tolerancePercent,
      minRate,
      maxRate,
      deviation: Math.abs(currentRate.price - expectedRate) / expectedRate * 100
    };
  } catch (error) {
    console.error(`Error validando rate para ${targetCrypto}:`, error.message);
    throw error;
  }
}

// Función para obtener balance USDC usando el contrato Polygon
async function getUSDTBalance(accountAddress) {
  try {
    console.log(`🔍 Obteniendo balance USDC para ${accountAddress}...`);
    
    // TODO: Implementar obtención de balance desde contrato ERC20 en Polygon
    // Por ahora retornamos un placeholder
    return {
      balance: 0,
      balance_u256: '0',
      accountAddress,
      tokenAddress: polygonOracle.usdcTokenAddress || '0xC37c16139a8eFC8f4c2B7CAA5C607514C825FC4C',
      source: 'POLYGON_USDC',
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error obteniendo balance USDC:', error.message);
    throw error;
  }
}

// Función para verificar estado del Oracle
async function getOracleStatus() {
  try {
    console.log('🔍 Verificando estado del Oracle de Polygon...');
    
    const statusResult = await polygonOracle.checkOracleStatus();
    
    return {
      isActive: statusResult.isActive,
      currentRate: statusResult.currentRate,
      oracleAddress: statusResult.oracleAddress,
      usdtTokenAddress: statusResult.usdtTokenAddress,
      status: statusResult.status,
      timestamp: statusResult.timestamp,
      error: statusResult.error || null
    };
  } catch (error) {
    console.error('Error verificando estado del Oracle:', error.message);
    return {
      isActive: false,
      currentRate: null,
      oracleAddress: polygonOracle.oracleAddress,
      usdtTokenAddress: '0xC37c16139a8eFC8f4c2B7CAA5C607514C825FC4C',
      status: 'ERROR',
      error: error.message,
      timestamp: new Date()
    };
  }
}

module.exports = {
  getCurrentPrice,
  startPriceOracle,
  getPriceHistory,
  updatePrices,
  convertARSToCrypto,
  getExchangeRateWithMargin,
  validateExchangeRate,
  getUSDTBalance,
  getOracleStatus
};

