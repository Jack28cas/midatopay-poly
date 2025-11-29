// Componente para mostrar el QR generado
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Copy, Download, X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrData: {
    qrCodeImage: string;
    paymentData: {
      amountARS: number;
      targetCrypto: string;
      cryptoAmount: number;
      exchangeRate: number;
      sessionId: string;
      merchantName: string;
    };
  };
  onRefreshQR?: () => void;
  refreshing?: boolean;
}

export function QRModal({ 
  isOpen, 
  onClose, 
  qrData, 
  onRefreshQR,
  refreshing = false 
}: QRModalProps) {
  const [copied, setCopied] = useState(false);
  const { t, language } = useLanguage();

  // Función para obtener el locale según el idioma
  const getLocale = () => {
    switch (language) {
      case 'es': return 'es-AR';
      case 'en': return 'en-US';
      case 'it': return 'it-IT';
      case 'pt': return 'pt-BR';
      case 'cn': return 'zh-CN';
      default: return 'en-US';
    }
  };

  if (!isOpen || !qrData) return null;

  // Calcular el monto en crypto usando la tasa fija: $1,000 ARS = 1 USDT/USDC
  const calculateCryptoAmount = (amountARS: number): number => {
    // Tasa fija: 1 USDT/USDC = 1,000 ARS
    return amountARS / 1000;
  };

  // Determinar el tipo de crypto (USDT)
  const cryptoType = qrData.paymentData.targetCrypto || 'USDT';
  
  // Obtener el monto en crypto (usar el del backend si existe y es válido, sino calcularlo)
  const cryptoAmount = qrData.paymentData.cryptoAmount && qrData.paymentData.cryptoAmount > 0
    ? qrData.paymentData.cryptoAmount
    : calculateCryptoAmount(qrData.paymentData.amountARS);

  const handleCopyQR = async () => {
    try {
      await navigator.clipboard.writeText(qrData.qrCodeImage);
      setCopied(true);
      toast.success(t.dashboard.createPayment.qrModal.success.qrCopied);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(t.dashboard.createPayment.qrModal.errors.errorCopyingQR);
    }
  };

  const handleDownloadQR = () => {
    try {
      const link = document.createElement('a');
      link.href = qrData.qrCodeImage;
      link.download = `pago-${qrData.paymentData.sessionId}.png`;
      link.click();
      toast.success(t.dashboard.createPayment.qrModal.success.qrDownloaded);
    } catch (error) {
      toast.error(t.dashboard.createPayment.qrModal.errors.errorDownloadingQR);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#ffffff', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                 style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' }}>
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#1a1a1a', fontFamily: 'Kufam, sans-serif' }}>
                {t.dashboard.createPayment.qrModal.title}
              </h2>
              <p className="text-sm" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif' }}>
                {t.dashboard.createPayment.qrModal.shareQR}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Contenido del QR */}
        <div className="text-center space-y-6">
          {/* QR Code */}
          <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200">
            <img
              src={qrData.qrCodeImage}
              alt={t.dashboard.createPayment.qrModal.paymentQRCode}
              className="w-64 h-64 mx-auto"
            />
            
            {refreshing && (
              <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(254, 108, 28, 0.1)', border: '1px solid rgba(254, 108, 28, 0.2)' }}>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 rounded-full border-2 border-orange-200 border-t-orange-500 animate-spin"></div>
                  <p className="text-sm" style={{ color: '#fe6c1c', fontFamily: 'Kufam, sans-serif' }}>
                    {t.dashboard.createPayment.qrModal.generatingNewQR}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Información del pago */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold" style={{ color: '#1a1a1a', fontFamily: 'Kufam, sans-serif' }}>
              {qrData.paymentData.merchantName}
            </h3>
            <p className="text-2xl font-bold" style={{ color: '#1a1a1a', fontFamily: 'Kufam, sans-serif' }}>
              ${qrData.paymentData.amountARS.toLocaleString(getLocale())} ARS
            </p>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800" style={{ fontFamily: 'Kufam, sans-serif' }}>
                <span className="font-semibold">{t.dashboard.createPayment.qrModal.youWillReceive}</span> {cryptoAmount.toFixed(6)} {cryptoType}
              </p>
              <p className="text-xs text-blue-600 mt-1" style={{ fontFamily: 'Kufam, sans-serif' }}>
                {cryptoType === 'USDC' ? '$1,000 ARS = 1 USDC' : t.dashboard.createPayment.exchangeRate}
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl"
              onClick={handleCopyQR}
              disabled={copied}
              style={{ fontFamily: 'Kufam, sans-serif' }}
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? t.dashboard.createPayment.qrModal.copied : t.dashboard.createPayment.qrModal.copyQR}
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl"
              style={{ backgroundColor: '#fe6c1c', color: '#ffffff', fontFamily: 'Kufam, sans-serif' }}
              onClick={handleDownloadQR}
            >
              <Download className="w-4 h-4 mr-2" />
              {t.dashboard.createPayment.qrModal.download}
            </Button>
          </div>

          {/* Botón refrescar QR */}
          {onRefreshQR && (
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl"
              onClick={onRefreshQR}
              disabled={refreshing}
              style={{ fontFamily: 'Kufam, sans-serif' }}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? t.dashboard.createPayment.qrModal.refreshing : t.dashboard.createPayment.qrModal.refreshQR}
            </Button>
          )}

          {/* Información adicional */}
          <div className="text-xs space-y-1" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif' }}>
            <p>{t.dashboard.createPayment.qrModal.sessionID} {qrData.paymentData.sessionId}</p>
            <p>{t.dashboard.createPayment.qrModal.generated} {new Date().toLocaleString(getLocale())}</p>
          </div>

          {/* Botón cerrar */}
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl"
            onClick={onClose}
            style={{ fontFamily: 'Kufam, sans-serif' }}
          >
            {t.dashboard.createPayment.qrModal.close}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
