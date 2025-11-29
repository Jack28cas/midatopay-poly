'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Mail, 
  DollarSign, 
  Users, 
  Clock, 
  ArrowRight,
  Star,
  Zap,
  Shield,
  TrendingUp,
  Sparkles
} from 'lucide-react'
import CustomHeader from '@/components/CustomHeader'
import Image from 'next/image'

export default function AnotatePage() {
  const [email, setEmail] = useState('')
  const [monthlyBilling, setMonthlyBilling] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [selectedBilling, setSelectedBilling] = useState('')

  const handleBillingSelection = (billing: string) => {
    setSelectedBilling(billing)
    setMonthlyBilling(billing)
    setShowEmailModal(true)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          monthly_billing_usd: parseInt(monthlyBilling)
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setEmail('')
        setMonthlyBilling('')
        setShowEmailModal(false)
      } else {
        const data = await response.json()
        setError(data.message || 'Error joining the waitlist')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
                    <span style={{ color: '#FF6A00' }}>MidatoPay</span>
                    <br />
                    The merchants' solution to protect themselves from{' '}
                    <span style={{ color: '#FF6A00' }}>Inflation</span>
              </h1>
              
              <p 
                    className="text-xl leading-relaxed mb-8"
                    style={{ fontFamily: 'Kufam, sans-serif', color: '#5d5d5d' }}
                  >
                    The first merchant wallet that allows charging with interoperable QR and receiving payments directly in cryptocurrencies. Protect your business against inflation while facilitating modern and secure transactions.
                  </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: <Shield className="w-5 h-5" style={{ color: '#FF6A00' }} />, text: "Protection against inflation" },
                    { icon: <Zap className="w-5 h-5" style={{ color: '#FF6A00' }} />, text: "Instant transactions" },
                    { icon: <TrendingUp className="w-5 h-5" style={{ color: '#FF6A00' }} />, text: "Crypto payments" },
                    { icon: <Star className="w-5 h-5" style={{ color: '#FF6A00' }} />, text: "Interoperable QR" }
                  ].map((feature, index) => (
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
                    Join the Waitlist
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
                  Waitlist
                </h2>
                
                <p 
                  className="text-lg mb-8"
                  style={{ fontFamily: 'Kufam, sans-serif', color: '#5d5d5d' }}
                >
                  What is your monthly billing?
                </p>

                {/* Billing Options */}
                <div className="space-y-3">
                  {[
                    { range: "Less than USD1,000", value: "500", votes: 5 },
                    { range: "USD1,000 - USD5,000", value: "1000", votes: 7 },
                    { range: "USD5,000 - USD10,000", value: "5000", votes: 3 },
                    { range: "USD10,000 - USD50,000", value: "10000", votes: 4 },
                    { range: "USD50,000 - USD100,000", value: "50000", votes: 2 },
                    { range: "More than USD100,000", value: "100000", votes: 3 }
                  ].map((option, index) => (
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
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(option.votes / 7) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-center">
                        <span 
                          className="text-xs font-medium"
                          style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif' }}
                        >
                          {option.votes} votes
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <p 
                  className="text-sm mt-6 text-center"
                  style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif' }}
                >
                  Get priority and exclusive access
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
              Waitlist
            </h2>
            
            <p 
              className="text-lg mb-6"
              style={{ fontFamily: 'Kufam, sans-serif', color: '#5d5d5d' }}
            >
              What is your monthly billing?
            </p>

            <div className="mb-6">
              <span 
                className="text-base"
                style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}
              >
                You selected:{' '}
                <span style={{ color: '#FF6A00', fontWeight: 'bold' }}>
                  {selectedBilling === '500' ? 'Less than USD1,000' :
                   selectedBilling === '1000' ? 'USD1,000 - USD5,000' :
                   selectedBilling === '5000' ? 'USD5,000 - USD10,000' :
                   selectedBilling === '10000' ? 'USD10,000 - USD50,000' :
                   selectedBilling === '50000' ? 'USD50,000 - USD100,000' :
                   'More than USD100,000'}
                </span>
              </span>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
                        <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5" style={{ color: '#5d5d5d' }} />
                          <Input
                            type="email"
                  placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 rounded-xl"
                            style={{ 
                    backgroundColor: '#FFFFFF', 
                    borderColor: '#E5E7EB',
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
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                      </Button>
                    </form>

            <p 
              className="text-sm mt-4 text-center"
              style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif' }}
            >
              Get priority and exclusive access
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
              You have successfully joined!
            </h3>
            <p 
              className="text-lg mb-6"
              style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif' }}
            >
              We will notify you when MidatoPay is available.
            </p>
            <Button
              onClick={() => setIsSuccess(false)}
              className="px-6 py-2 rounded-xl"
              style={{ 
                backgroundColor: '#FF6A00',
                fontFamily: 'Kufam, sans-serif'
              }}
            >
              Close
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  )
}