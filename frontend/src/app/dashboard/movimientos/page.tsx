'use client'

import { motion } from 'framer-motion'
import { useTransactions } from '@/hooks/useTransactions'
// Removed ChipiPay transactions
import { useLanguage } from '@/contexts/LanguageContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, DollarSign } from 'lucide-react'

export default function MovimientosPage() {
  const { transactions, loading: transactionsLoading, error: transactionsError } = useTransactions()
  const { t } = useLanguage()
  
  // Combinar transacciones y ordenar por fecha
  const allTransactions = transactions.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return dateB - dateA
  })
  
  const isLoading = transactionsLoading
  const hasError = transactionsError

  return (
    <DashboardLayout pageTitle={t.dashboard.movements}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Movimientos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>{t.dashboard.movements}</h3>
            <p className="text-sm" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>{t.dashboard.transactionHistory}</p>
          </div>

          <Card style={{ 
            backgroundColor: '#fff5f0', 
            borderColor: '#fec665', 
            boxShadow: '0 10px 30px rgba(254,108,28,0.08)', 
            backdropFilter: 'blur(10px)' 
          }}>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-sm" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>
                    {t.dashboard.loadingMovements}
                  </p>
                </div>
              ) : hasError ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium mb-2" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>{t.dashboard.errorLoading}</h4>
                  <p className="text-sm" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>
                    {transactionsError}
                  </p>
                </div>
              ) : allTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(254,108,28,0.1)' }}>
                    <svg className="w-8 h-8" style={{ color: '#fe6c1c' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium mb-2" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>{t.dashboard.noMovements}</h4>
                  <p className="text-sm" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>
                    {t.dashboard.successfulTransfers}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-white rounded-lg border" style={{ borderColor: 'rgba(254,108,28,0.2)' }}>
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ 
                          backgroundColor: transaction.status === 'CONFIRMED' ? '#10B981' : '#F59E0B'
                        }}>
                          {transaction.status === 'CONFIRMED' ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h5 className="font-medium" style={{ color: '#2C2C2C', fontFamily: 'Kufam, sans-serif', fontWeight: 600 }}>
                            {transaction.payment?.concept || 'Transacción'}
                          </h5>
                          <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>
                            {new Date(transaction.createdAt).toLocaleDateString('es-AR')} {new Date(transaction.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: '#FF6A00', fontFamily: 'Kufam, sans-serif', fontWeight: 600 }}>
                          ${transaction.amount.toLocaleString('es-AR')} ARS
                        </p>
                        <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>
                          → ${transaction.finalAmount?.toFixed(6) || '0'} ${transaction.finalCurrency || 'USDT'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

