'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  CheckCircle, 
  Mail, 
  Zap, 
  Shield, 
  TrendingUp, 
  Star
} from 'lucide-react'
import CustomHeader from '@/components/CustomHeader'
import { useLanguage } from '@/contexts/LanguageContext'

export default function WaitlistPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [monthlyBilling, setMonthlyBilling] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [selectedBilling, setSelectedBilling] = useState('')
  const [billingOptions, setBillingOptions] = useState([
    { range: t.waitlist.billingOptions.lessThan1000, value: "500", votes: 5 },
    { range: t.waitlist.billingOptions["1000to5000"], value: "1000", votes: 7 },
    { range: t.waitlist.billingOptions["5000to10000"], value: "5000", votes: 3 },
    { range: t.waitlist.billingOptions["10000to50000"], value: "10000", votes: 4 },
    { range: t.waitlist.billingOptions["50000to100000"], value: "50000", votes: 2 },
    { range: t.waitlist.billingOptions.moreThan100000, value: "100000", votes: 3 }
  ])

  const getBillingRange = (value: string) => {
    const option = billingOptions.find(opt => opt.value === value)
    return option ? option.range : ''
  }

  const handleBillingSelection = (billing: string) => {
    setSelectedBilling(billing)
    setMonthlyBilling(billing)
    setError('') // Limpiar errores previos
    setShowEmailModal(true)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Validación básica del email en el frontend
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const trimmedEmail = email.trim()
    
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError('Por favor ingresa un email válido')
      setIsSubmitting(false)
      return
    }

    // Validar que monthlyBilling esté establecido
    if (!monthlyBilling || monthlyBilling === '') {
      setError('Por favor selecciona una opción de facturación')
      setIsSubmitting(false)
      return
    }

    const billingValue = parseInt(monthlyBilling)
    if (isNaN(billingValue) || billingValue < 500) {
      setError('El valor de facturación no es válido')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          monthly_billing_usd: billingValue
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setEmail('')
        setMonthlyBilling('')
        setShowEmailModal(false)
        
        // Actualizar los votos de la opción seleccionada
        setBillingOptions(prevOptions => 
          prevOptions.map(option => 
            option.value === monthlyBilling 
              ? { ...option, votes: option.votes + 1 }
              : option
          )
        )
        
        // Disparar evento para actualizar estadísticas en otras páginas
        window.dispatchEvent(new CustomEvent('waitlist-updated'))
      } else {
        const data = await response.json()
        // Mostrar el error específico del backend si está disponible
        const errorMessage = data.details && data.details.length > 0 
          ? data.details[0].msg || data.message || t.waitlist.errors.joinError
          : data.message || t.waitlist.errors.joinError
        setError(errorMessage)
      }
    } catch (err) {
      setError(t.waitlist.errors.connectionError)
    } finally {
      setIsSubmitting(false)
    }
  }

  const features = [
    { icon: <Shield className="w-5 h-5" style={{ color: '#FF6A00' }} />, text: t.waitlist.features.protection },
    { icon: <Zap className="w-5 h-5" style={{ color: '#FF6A00' }} />, text: t.waitlist.features.instant },
    { icon: <TrendingUp className="w-5 h-5" style={{ color: '#FF6A00' }} />, text: t.waitlist.features.crypto },
    { icon: <Star className="w-5 h-5" style={{ color: '#FF6A00' }} />, text: t.waitlist.features.qr }
  ]

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <CustomHeader />
      
      {/* Content */}
      <div className="relative z-10 pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto">
            
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
              
              {/* Left Column - Product Info */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div>
                  <h1 
                    className="text-5xl md:text-6xl font-bold mb-6"
                    style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C', lineHeight: '1.2' }}
                  >
                    <span style={{ color: '#FF6A00' }}>{t.waitlist.title}</span>
                    <br />
                    {t.waitlist.subtitle}{' '}
                    <span style={{ color: '#FF6A00' }}>{t.waitlist.inflation}</span>
                  </h1>
                  
                  <p 
                    className="text-xl leading-relaxed mb-8"
                    style={{ fontFamily: 'Kufam, sans-serif', color: '#5d5d5d' }}
                  >
                    {t.waitlist.description}
                  </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      {feature.icon}
                      <span 
                        className="text-lg font-medium"
                        style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}
                      >
                        {feature.text}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Button
                    size="lg"
                    className="px-8 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    style={{ 
                      background: 'linear-gradient(90deg, #FF6A00 0%, #FF8C42 100%)',
                      color: '#FFFFFF',
                      fontFamily: 'Kufam, sans-serif',
                      boxShadow: '0 4px 15px rgba(255, 106, 0, 0.3)'
                    }}
                    onClick={() => document.getElementById('waitlist-section')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {t.waitlist.ctaButton}
                  </Button>
                </motion.div>
              </motion.div>
              
              {/* Right Column - Waitlist Survey */}
              <div className="flex justify-end">
                <motion.div
                  id="waitlist-section"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="bg-white rounded-2xl p-6 shadow-xl max-w-sm"
                >
                  <h2 
                    className="text-2xl font-bold mb-6"
                    style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}
                  >
                    {t.waitlist.waitlistTitle}
                  </h2>
                  
                  <p 
                    className="text-lg mb-8"
                    style={{ fontFamily: 'Kufam, sans-serif', color: '#5d5d5d' }}
                  >
                    {t.waitlist.question}
                  </p>

                  {/* Billing Options */}
                  <div className="space-y-3">
                    {billingOptions.map((option, index) => {
                      // Calcular el máximo de votos para normalizar las barras
                      const maxVotes = Math.max(...billingOptions.map(opt => opt.votes), 7)
                      // Asegurar que el porcentaje nunca supere el 100%
                      const percentage = Math.min((option.votes / maxVotes) * 100, 100)
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                          className="cursor-pointer px-4 py-3 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-sm transition-all duration-300 bg-white hover:bg-orange-50"
                          onClick={() => handleBillingSelection(option.value)}
                        >
                          <div className="text-center mb-2">
                            <span 
                              className="font-medium text-sm"
                              style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}
                            >
                              {option.range}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1 overflow-hidden">
                            <div 
                              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%`, maxWidth: '100%' }}
                            ></div>
                          </div>
                          <div className="text-center">
                            <span 
                              className="text-xs font-medium"
                              style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif' }}
                            >
                              {option.votes} {t.waitlist.votes}
                            </span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  <p 
                    className="text-sm mt-6 text-center"
                    style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif' }}
                  >
                    {t.waitlist.priority}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEmailModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowEmailModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}
            >
              {t.waitlist.modal.title}
            </h2>
            
            <p 
              className="text-lg mb-6"
              style={{ fontFamily: 'Kufam, sans-serif', color: '#5d5d5d' }}
            >
              {t.waitlist.modal.question}
            </p>

            <div className="mb-6">
              <span 
                className="text-base"
                style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}
              >
                {t.waitlist.modal.youSelected}{' '}
                <span style={{ color: '#FF6A00', fontWeight: 'bold' }}>
                  {getBillingRange(selectedBilling)}
                </span>
              </span>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5" style={{ color: '#5d5d5d' }} />
                <Input
                  type="email"
                  placeholder={t.waitlist.modal.emailPlaceholder}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('') // Limpiar error cuando el usuario escribe
                  }}
                  className="pl-12 h-12 text-lg border-2 rounded-xl"
                  style={{ 
                    backgroundColor: '#FFFFFF', 
                    borderColor: error ? '#DC2626' : '#E5E7EB',
                    color: '#2C2C2C'
                  }}
                  required
                />
              </div>

              {error && (
                <motion.div 
                  className="p-3 rounded-xl border-2"
                  style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm font-medium" style={{ color: '#DC2626', fontFamily: 'Kufam, sans-serif' }}>
                    {error}
                  </p>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-lg font-semibold rounded-xl"
                style={{ 
                  backgroundColor: '#FF6A00',
                  fontFamily: 'Kufam, sans-serif'
                }}
              >
                {isSubmitting ? t.waitlist.modal.subscribing : t.waitlist.modal.subscribe}
              </Button>
            </form>

            <p 
              className="text-sm mt-4 text-center"
              style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif' }}
            >
              {t.waitlist.modal.priorityText}
            </p>
          </motion.div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccess && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsSuccess(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsSuccess(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#FF6A00' }} />
            <h3 
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}
            >
              {t.waitlist.success.title}
            </h3>
            <p 
              className="text-lg mb-6"
              style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif' }}
            >
              {t.waitlist.success.message}
            </p>
            <Button
              onClick={() => setIsSuccess(false)}
              className="px-6 py-2 rounded-xl"
              style={{ 
                backgroundColor: '#FF6A00',
                fontFamily: 'Kufam, sans-serif'
              }}
            >
              {t.waitlist.success.close}
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

