// Componente para mostrar información de conversión usando Oracle real de blockchain
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useOracleConversion } from '@/hooks/useOracleConversion';

interface OracleConversionPreviewProps {
  amountARS: number;
  targetCrypto: string;
}

export function OracleConversionPreview({ 
  amountARS, 
  targetCrypto 
}: OracleConversionPreviewProps) {
  const [conversionResult, setConversionResult] = useState<{
    cryptoAmount: number;
    source: string;
  } | null>(null);
  
  const { convertARSToCrypto, loading, error } = useOracleConversion();

  // Consultar Oracle real cuando cambia el monto (con debounce mínimo)
  useEffect(() => {
    if (!amountARS || amountARS <= 0) {
      setConversionResult(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        console.log('🔄 Consultando Oracle real para:', amountARS, 'ARS');
        
        const result = await convertARSToCrypto(amountARS, targetCrypto);
        setConversionResult(result);
        
        if (result) {
          console.log('✅ Oracle response:', result);
        }
      } catch (err) {
        console.error('❌ Oracle error:', err);
      }
    }, 1000); // Debounce mínimo de 1 segundo

    return () => clearTimeout(timeoutId);
  }, [amountARS, targetCrypto, convertARSToCrypto]);

  if (!amountARS || amountARS <= 0) {
    return null;
  }

  if (loading) {
    return (
      <Card className="mt-4 p-4"
        style={{ 
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(254, 108, 28, 0.1)'
        }}
      >
        <CardContent className="p-0">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 rounded-full border-2 border-orange-200 border-t-orange-500 animate-spin"></div>
            <p className="text-sm" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif' }}>
              Consultando Oracle de blockchain...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-4 p-4 border-red-200 bg-red-50">
        <CardContent className="p-0">
          <p className="text-sm text-red-800" style={{ fontFamily: 'Kufam, sans-serif' }}>
            ⚠️ Error consultando Oracle: {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!conversionResult) {
    return (
      <Card className="mt-4 p-4 border-yellow-200 bg-yellow-50">
        <CardContent className="p-0">
          <p className="text-sm text-yellow-800" style={{ fontFamily: 'Kufam, sans-serif' }}>
            ⚠️ Oracle no disponible
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4 p-4"
      style={{ 
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 147, 147, 0.2)',
        boxShadow: '0 4px 12px rgba(0, 147, 147, 0.1)'
      }}
    >
      <CardContent className="p-0">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#009393' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <g clipPath="url(#USDT_preview)">
                  <path fill="#009393" d="M24 0H0v24h24z"/>
                  <path fill="#fff" d="m12 18.4-8-7.892L7.052 5.6h9.896L20 10.508zm.8-7.2v-.976c1.44.072 2.784.352 3.2.716-.484.424-2.216.732-4 .732s-3.516-.308-4-.732c.412-.364 1.76-.64 3.2-.72v.98zM8 10.936v.588c.412.364 1.756.64 3.2.72V14.4h1.6v-2.16c1.44-.072 2.788-.352 3.2-.716v-1.172c-.412-.364-1.76-.644-3.2-.72V8.8h2.4V7.6H8.8v1.2h2.4v.832c-1.444.076-2.788.356-3.2.72z"/>
                </g>
                <defs>
                  <clipPath id="USDT_preview">
                    <path fill="#fff" d="M0 0h24v24H0z"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: '#009393', fontFamily: 'Kufam, sans-serif' }}>
                Recibirás: {Number(conversionResult.cryptoAmount).toFixed(6)} USDT
              </p>
              <p className="text-sm" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif' }}>
                Conversión directa del Oracle
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-xs" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif' }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#009393' }}></div>
            <span>Oracle de Blockchain</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
