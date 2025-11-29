// Componente para mostrar información de conversión
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ConversionPreviewProps {
  amountARS: number;
  targetCrypto: string;
  conversionResult: {
    cryptoAmount: number;
    exchangeRate: number;
    source: string;
  } | null;
  loading?: boolean;
}

export function ConversionPreview({ 
  amountARS, 
  targetCrypto, 
  conversionResult, 
  loading = false 
}: ConversionPreviewProps) {
  if (!amountARS || amountARS <= 0) {
    return null;
  }

  if (loading) {
    return (
      <Card className="mt-4 p-4">
        <CardContent className="p-0">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 rounded-full border-2 border-orange-200 border-t-orange-500 animate-spin"></div>
            <p className="text-sm text-gray-600">Calculando conversión...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!conversionResult) {
    return (
      <Card className="mt-4 p-4 border-yellow-200 bg-yellow-50">
        <CardContent className="p-0">
          <p className="text-sm text-yellow-800">
            ⚠️ No se pudo obtener el rate para {targetCrypto}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4 p-4 border-green-200 bg-green-50">
      <CardContent className="p-0">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-green-800">
            💰 Recibirás: {conversionResult.cryptoAmount.toFixed(6)} {targetCrypto}
          </p>
          <p className="text-xs text-green-700">
            📊 Rate: 1 {targetCrypto} = {conversionResult.exchangeRate.toLocaleString()} ARS
          </p>
          <p className="text-xs text-green-600">
            🔄 Fuente: {conversionResult.source}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
