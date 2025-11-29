// Hook para manejar conversiones ARS → Crypto
import { useState, useEffect } from 'react';

interface ConversionRate {
  currency: string;
  rate: number;
  source: string;
  timestamp: Date;
}

interface ConversionResult {
  amountARS: number;
  targetCrypto: string;
  cryptoAmount: number;
  exchangeRate: number;
  source: string;
  timestamp: Date;
}

export function useCryptoConversion() {
  const [rates, setRates] = useState<Record<string, ConversionRate>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener rates actuales
  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/oracle/prices`);
      const data = await response.json();
      
      if (data.prices) {
        const ratesMap: Record<string, ConversionRate> = {};
        Object.keys(data.prices).forEach((currency) => {
          const priceData = data.prices[currency];
          if (priceData.price) {
            ratesMap[currency] = {
              currency: currency,
              rate: priceData.price,
              source: priceData.source,
              timestamp: new Date(priceData.timestamp)
            };
          }
        });
        setRates(ratesMap);
      }
    } catch (err) {
      setError('Error obteniendo rates de conversión');
      console.error('Error fetching rates:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calcular conversión ARS → Crypto
  const convertARSToCrypto = (amountARS: number, targetCrypto: string): ConversionResult | null => {
    if (!amountARS || amountARS <= 0 || !targetCrypto) {
      return null;
    }

    const rate = rates[targetCrypto];
    if (!rate) {
      return null;
    }

    const cryptoAmount = amountARS / rate.rate;
    
    return {
      amountARS,
      targetCrypto,
      cryptoAmount,
      exchangeRate: rate.rate,
      source: rate.source,
      timestamp: rate.timestamp
    };
  };

  // Obtener rate de una crypto específica
  const getRate = (crypto: string): number | null => {
    return rates[crypto]?.rate || null;
  };

  // Obtener información de rate
  const getRateInfo = (crypto: string): ConversionRate | null => {
    return rates[crypto] || null;
  };

  // Cargar rates al montar el componente
  useEffect(() => {
    fetchRates();
    
    // Actualizar rates cada 30 segundos
    const interval = setInterval(fetchRates, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    rates,
    loading,
    error,
    convertARSToCrypto,
    getRate,
    getRateInfo,
    refreshRates: fetchRates
  };
}
