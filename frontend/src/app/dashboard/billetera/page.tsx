'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
// Removed ChipiPay and Starknet imports
import { useLanguage } from '@/contexts/LanguageContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, DollarSign } from 'lucide-react'

export default function BilleteraPage() {
  const { user, isLoading: profileLoading } = useUserProfile()
  const { t } = useLanguage()
  
  const [merchantWallet, setMerchantWallet] = useState({
    isConnected: false,
    address: null as string | null,
    balance: null as string | null,
    isLoading: true
  })

  // Obtener wallet desde el perfil del usuario (base de datos)
  useEffect(() => {
    if (profileLoading) {
      setMerchantWallet(prev => ({ ...prev, isLoading: true }))
      return
    }

    if (user?.walletAddress) {
      const walletAddress = user.walletAddress
      
      // Validar que sea una dirección de Polygon (42 caracteres)
      if (walletAddress.length === 42) {
        console.log('✅ Wallet obtenida desde BD (Polygon):', walletAddress)
        setMerchantWallet({
          isConnected: true,
          address: walletAddress,
          balance: null,
          isLoading: false
        })
        
        // Limpiar localStorage si tiene una wallet incompatible
        try {
          const localWallet = localStorage.getItem('midatopay_merchant_wallet')
          if (localWallet) {
            const parsed = JSON.parse(localWallet)
            if (parsed.address && parsed.address.length !== 42) {
              console.log('🧹 Limpiando wallet de localStorage (dirección incompatible)')
              localStorage.removeItem('midatopay_merchant_wallet')
            }
          }
        } catch (e) {
          // Ignorar errores al limpiar localStorage
        }
      } else {
        console.warn('⚠️ Dirección de wallet inválida (no es Polygon):', walletAddress)
        setMerchantWallet(prev => ({ ...prev, isLoading: false }))
      }
    } else {
      console.log('⚠️ Usuario no tiene wallet en BD')
      setMerchantWallet(prev => ({ ...prev, isLoading: false }))
    }
  }, [user?.walletAddress, profileLoading])

  // Mostrar mensaje si no hay wallet conectada
  if (!merchantWallet.isConnected && !merchantWallet.isLoading) {
    return (
      <DashboardLayout pageTitle={t.dashboard.sidebar.wallet}>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50 flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wallet className="w-5 h-5" />
                <span>No Wallet Found</span>
              </CardTitle>
              <CardDescription>
                Your wallet will be created automatically when you generate your first payment QR code.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  // Mostrar loading mientras se carga
  if (merchantWallet.isLoading) {
    return (
      <DashboardLayout pageTitle={t.dashboard.sidebar.wallet}>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando wallet...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle={t.dashboard.sidebar.wallet}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sección de Información de Wallet */}
        {merchantWallet.isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card style={{ 
              backgroundColor: 'rgba(16,185,129,0.05)', 
              borderColor: 'rgba(16,185,129,0.2)', 
              boxShadow: '0 10px 30px rgba(16,185,129,0.1)', 
              backdropFilter: 'blur(10px)' 
            }}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                  <span style={{ color: '#1a1a1a', fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>{t.dashboard.walletInformation}</span>
                </CardTitle>
                <CardDescription style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>
                  {t.dashboard.walletDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dirección */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2" style={{ fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>{t.dashboard.address}</h4>
                    <p className="text-sm font-mono text-green-800 break-all" style={{ fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>
                      {merchantWallet.address}
                    </p>
                    <p className="text-xs text-green-600 mt-1" style={{ fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>{t.dashboard.yourWalletAddress}</p>
                  </div>
                  
                  {/* Red */}
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2" style={{ fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>{t.dashboard.network}</h4>
                    <p className="text-lg font-bold text-purple-900" style={{ fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>Polygon</p>
                    <p className="text-sm text-purple-700" style={{ fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Mainnet</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Sección ChipiPay eliminada */}
      </div>
    </DashboardLayout>
  )
}

