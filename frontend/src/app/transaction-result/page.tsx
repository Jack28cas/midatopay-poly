'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, ExternalLink, ArrowLeft, Copy, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface TransactionResult {
  paymentId: string
  merchantAddress: string
  amountARS: number
  merchantName: string
  concept: string
  expiresAt: string
  status: string
  blockchainTransaction?: {
    hash: string
    explorerUrl: string
    success: boolean
  }
}

export default function TransactionResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [transactionData, setTransactionData] = useState<TransactionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Obtener datos de la transacción desde los parámetros de URL
    const paymentId = searchParams.get('paymentId')
    const merchantAddress = searchParams.get('merchantAddress')
    const amountARS = searchParams.get('amountARS')
    const merchantName = searchParams.get('merchantName')
    const concept = searchParams.get('concept')
    const status = searchParams.get('status')
    const txHash = searchParams.get('txHash')
    const explorerUrl = searchParams.get('explorerUrl')

    if (paymentId && merchantAddress && amountARS) {
      setTransactionData({
        paymentId,
        merchantAddress,
        amountARS: parseInt(amountARS),
        merchantName: merchantName || 'Merchant',
        concept: concept || 'USDC',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
        status: status || 'PENDING',
        blockchainTransaction: txHash && txHash !== 'undefined' ? {
          hash: txHash,
          explorerUrl: explorerUrl && explorerUrl !== 'undefined' ? explorerUrl : `https://polygonscan.com/tx/${txHash}`,
          success: true
        } : undefined
      })
    } else {
      setError('Transaction data not found')
    }
    
    setLoading(false)
  }, [searchParams])

  const handleCopyHash = async () => {
    if (transactionData?.blockchainTransaction?.hash) {
      try {
        await navigator.clipboard.writeText(transactionData.blockchainTransaction.hash)
        toast.success('Hash copied to clipboard')
      } catch (error) {
        toast.error('Error copying hash')
      }
    }
  }

  const handleOpenExplorer = () => {
    if (transactionData?.blockchainTransaction?.explorerUrl) {
      window.open(transactionData.blockchainTransaction.explorerUrl, '_blank')
    }
  }

  const handleScanAnother = () => {
    router.push('/scan')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f7f7f6' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transaction details...</p>
        </div>
      </div>
    )
  }

  if (error || !transactionData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f7f7f6' }}>
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => router.push('/scan')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Scanner
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f7f6' }}>
      {/* Header */}
      <header className="shadow-sm border-b" style={{ backgroundColor: '#f7f7f6', borderColor: 'rgba(26,26,26,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/scan" className="mr-4">
              <Button variant="ghost" size="sm" style={{ color: '#1a1a1a' }}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' }}>
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ fontFamily: 'Kufam, sans-serif', color: '#1a1a1a' }}>
                  Transaction Executed
                </h1>
                <p className="text-sm" style={{ color: '#5d5d5d' }}>
                  Blockchain transaction details
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Detalles de la Transacción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" style={{ color: '#10b981' }} />
                  <span>Payment Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount</p>
                    <p className="text-lg font-bold" style={{ color: '#1a1a1a' }}>
                      ${transactionData.amountARS.toLocaleString()} ARS
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Concept</p>
                    <p className="text-lg font-bold" style={{ color: '#1a1a1a' }}>
                      {transactionData.concept}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Merchant</p>
                  <p className="text-lg font-bold" style={{ color: '#1a1a1a' }}>
                    {transactionData.merchantName}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Payment ID</p>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded" style={{ color: '#1a1a1a' }}>
                    {transactionData.paymentId}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Merchant Address</p>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all" style={{ color: '#1a1a1a' }}>
                    {transactionData.merchantAddress}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${transactionData.status === 'PENDING' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                    <span className="font-medium" style={{ color: '#1a1a1a' }}>
                      {transactionData.status === 'PENDING' ? 'Pending' : 'Confirmed'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detalles de la Blockchain */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ExternalLink className="w-5 h-5" style={{ color: '#fe6c1c' }} />
                  <span>Blockchain Transaction</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {transactionData.blockchainTransaction ? (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Transaction Executed</span>
                      </div>
                      <p className="text-sm text-green-700">
                        The transaction has been successfully sent to the Polygon blockchain.
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Transaction Hash</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-mono bg-gray-100 p-2 rounded flex-1 break-all" style={{ color: '#1a1a1a' }}>
                          {transactionData.blockchainTransaction.hash}
                        </p>
                        <Button
                          onClick={handleCopyHash}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={handleOpenExplorer}
                        className="w-full"
                        style={{ background: 'linear-gradient(135deg, #fe6c1c 0%, #fe9c42 100%)' }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Polygonscan
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" />
                      <span className="font-medium text-yellow-800">Processing Transaction</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      The transaction is being processed on the blockchain. This may take a few minutes.
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button
                    onClick={handleScanAnother}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Scan Another QR
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
