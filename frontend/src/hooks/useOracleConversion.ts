// Hook para manejar conversiones ARS → USDC usando Oracle de Polygon
import { useState } from 'react';

interface OracleConversionResult {
  cryptoAmount: number;
  exchangeRate: number;
  source: string;
}

export function useOracleConversion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Llamada al Oracle de Polygon a través del backend
  const quoteARSToUSDC = async (amountARS: number): Promise<OracleConversionResult | null> => {
    if (!amountARS || amountARS <= 0) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Llamar al endpoint del backend que usa el Oracle de Polygon
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/oracle/quote/${amountARS}`);
      
      if (!response.ok) {
        throw new Error('Error al consultar el Oracle');
      }

      const data = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Oracle no disponible');
      }

      const { cryptoAmount, exchangeRate, source } = data.data;
      
      return {
        cryptoAmount: Number(cryptoAmount),
        exchangeRate: Number(exchangeRate),
        source: source || 'POLYGON_ORACLE'
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error consultando Oracle de Polygon';
      setError(errorMessage);
      console.error('Error calling Oracle:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Conversión ARS → USDC usando Oracle de Polygon
  const convertARSToCrypto = async (amountARS: number, targetCrypto: string): Promise<OracleConversionResult | null> => {
    if (targetCrypto !== 'USDC') {
      setError('Solo USDC está soportado por el Oracle de Polygon');
      return null;
    }

    return await quoteARSToUSDC(amountARS);
  };

  return {
    loading,
    error,
    convertARSToCrypto,
    quoteARSToUSDC
  };
}
