'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import CustomHeader from '@/components/CustomHeader'
import ScrollVelocity from '@/components/ScrollVelocity'

export default function Home() {
  const [typewriterText, setTypewriterText] = useState('')
  const fullText = 'inflation'

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setTypewriterText(fullText.slice(0, index))
        index++
      } else {
        clearInterval(interval)
      }
    }, 150)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF6A00' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 z-5 pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 w-4 h-4 bg-orange-500 rounded-full opacity-20"
        />
        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -3, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-40 right-20 w-3 h-3 bg-orange-400 rounded-full opacity-30"
        />
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 4, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-40 left-20 w-2 h-2 bg-orange-600 rounded-full opacity-25"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 pt-24">
      {/* Custom Header */}
      <CustomHeader />

      {/* Info Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-black border-b border-gray-700 py-2 overflow-hidden">
        <ScrollVelocity
          velocity={40}
          className="flex items-center space-x-2 text-sm font-medium text-white"
          parallaxClassName="parallax"
          scrollerClassName="scroller"
          scrollerStyle={{ display: 'inline-flex', alignItems: 'center', gap: '2rem' }}
        >
          <div className="flex items-center space-x-2">
            <span>Exclusive benefits</span>
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div className="flex items-center space-x-2">
            <span>Instant conversion</span>
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex items-center space-x-2">
            <span>Merchant support</span>
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
            </svg>
          </div>
        </ScrollVelocity>
      </div>

      {/* Hero Section */}
      <section className="py-16 px-6" style={{ 
        background: 'linear-gradient(180deg, rgba(255, 106, 0, 0.4) 0%, rgba(255, 106, 0, 0.1) 40%, rgba(255, 255, 255, 1) 50%)' 
      }}>
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="text-left">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex justify-start mb-6">
                </div>
                
                <h1 
                  className="text-4xl md:text-[85px] font-bold mb-4 leading-[0.95]" 
                  style={{ 
                    fontFamily: 'Kufam, sans-serif', 
                    color: '#2C2C2C',
                    fontWeight: 700
                  }}
                >
                  Your business, immune to{' '}
                  <span className="text-orange-500">
                    {typewriterText}
                    <span className="animate-pulse">|</span>
                  </span>
                </h1>
                
                  <p 
                  className="text-3xl mb-14 leading-[1.2]" 
                    style={{ 
                    fontFamily: 'Kufam, sans-serif', 
                    color: '#FF6A00',
                    fontWeight: 500
                  }}
                >
                  Protect the value of your sales <br />without changing how you collect.
                </p>
                
                {/* Crypto Badges */}
                <div className="flex items-center gap-4 flex-wrap mb-6">
                  <span className="text-lg font-semibold" style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}>Collect:</span>
                  <div className="flex items-center gap-3">
                    {/* ARS Badge */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ 
                      background: 'linear-gradient(135deg, rgba(74,144,226,0.12) 0%, rgba(74,144,226,0.06) 100%)', 
                      border: '1px solid rgba(74,144,226,0.25)',
                      boxShadow: '0 4px 12px rgba(74,144,226,0.15)'
                    }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4A90E2' }}>
                        <Image 
                          src="/argentina-flag.svg" 
                          alt="Argentina Flag" 
                          width={16} 
                          height={16}
                          className="object-contain"
                        />
                      </div>
                      <span className="text-sm font-semibold" style={{ color: '#4A90E2' }}>ARS</span>
                    </div>
                  </div>
                  
                  <span className="text-lg font-semibold ml-4" style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}>Receive:</span>
                  <div className="flex items-center gap-3">
                    {/* USDT Badge */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ 
                      background: 'linear-gradient(135deg, rgba(0,201,167,0.12) 0%, rgba(0,201,167,0.06) 100%)', 
                      border: '1px solid rgba(0,201,167,0.25)',
                      boxShadow: '0 4px 12px rgba(0,201,167,0.15)'
                    }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#00C9A7' }}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: '#00C9A7' }}>USDT</span>
                    </div>

                    {/* BTC Badge */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ 
                      background: 'linear-gradient(135deg, rgba(247,147,26,0.12) 0%, rgba(247,147,26,0.06) 100%)', 
                      border: '1px solid rgba(247,147,26,0.25)',
                      boxShadow: '0 4px 12px rgba(247,147,26,0.15)'
                    }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F7931A' }}>
                        <span className="text-xs font-bold text-white">B</span>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: '#F7931A' }}>BTC</span>
                    </div>

                    {/* ETH Badge */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ 
                      background: 'linear-gradient(135deg, rgba(139,69,255,0.12) 0%, rgba(139,69,255,0.06) 100%)', 
                      border: '1px solid rgba(139,69,255,0.25)',
                      boxShadow: '0 4px 12px rgba(139,69,255,0.15)'
                    }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8B45FF' }}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: '#8B45FF' }}>ETH</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-8">
                  <Link href="/auth/register">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-orange-500 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
                      style={{ 
                        fontFamily: 'Kufam, sans-serif',
                        background: 'linear-gradient(135deg, #FF6A00 0%, #FF8533 100%)',
                        boxShadow: '0 8px 25px rgba(255, 106, 0, 0.3)'
                      }}
                    >
                      Get Started
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
                </div>

            {/* Right Side - Character */}
            <div className="flex justify-center items-start pt-8">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative flex items-start justify-center"
              >
                <Image 
                  src="/gato.svg" 
                  alt="MidatoPay Cat" 
                  width={300} 
                  height={100} 
                  className="drop-shadow-2xl"
                  style={{ filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.15))' }}
                />
              </motion.div>
            </div>
                      </div>
                    </div>
      </section>

      {/* Promotional Cards Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Empezá a ganarle a la inflación */}
              <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative rounded-2xl p-6 shadow-xl"
              style={{ backgroundColor: '#FF6A00' }}
            >
              <div className="text-white">
                <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'Kufam, sans-serif' }}>
                  Start beating
                </h3>
                <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'Kufam, sans-serif' }}>
                  inflation
                </h3>
                <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Kufam, sans-serif' }}>
                </h3>
                
                <button className="bg-white text-orange-600 px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors text-sm">
                  Start
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </motion.div>

            {/* Card 2: QR interoperable */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-2xl p-6 shadow-xl bg-white border border-gray-200"
            >
              <div className="text-gray-800">
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Kufam, sans-serif' }}>
                  Interoperable QR
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Accept any wallet
                </p>
                
                <button className="text-orange-600 px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-orange-50 transition-colors text-sm border border-orange-200">
                  Learn More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </motion.div>

            {/* Card 3: +50 Comercios */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative rounded-2xl p-6 shadow-xl bg-white border border-gray-200"
            >
              <div className="text-gray-800">
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Kufam, sans-serif' }}>
                  +50 Merchants
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  choose MidatoPay
                </p>
                
                <button className="text-orange-600 px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-orange-50 transition-colors text-sm border border-orange-200">
                  Be Part
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}>
              Why Choose MidatoPay?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The complete solution for merchants who want to protect their business from inflation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}>
                Instant Conversion
              </h3>
              <p className="text-gray-600">
                Convert your ARS sales to stable cryptocurrencies instantly, protecting your capital from inflation.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}>
                Secure Payments
              </h3>
              <p className="text-gray-600">
                All transactions are verified on the blockchain, ensuring maximum security and transparency.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}>
                Easy Integration
              </h3>
              <p className="text-gray-600">
                Simple setup process. Your customers pay normally, you receive stable cryptocurrencies.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4" style={{ backgroundColor: '#FF6A00' }}>
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'Kufam, sans-serif' }}>
              Ready to Protect Your Business?
            </h2>
            <p className="text-xl text-white mb-8 opacity-90">
              Join the merchants who are already protecting their capital from inflation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-orange-500 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ fontFamily: 'Kufam, sans-serif' }}
                >
                  Start Now
                </motion.button>
              </Link>
              <Link href="/anotate">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-xl hover:bg-white hover:text-orange-500 transition-all duration-300"
                  style={{ fontFamily: 'Kufam, sans-serif' }}
                >
                  Join Waitlist
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <Image 
                  src="/logo.png" 
                  alt="MidatoPay Logo" 
                  width={40} 
                  height={40}
                  className="object-contain"
                />
                <span className="ml-3 text-2xl font-bold text-white" style={{ fontFamily: 'Kufam, sans-serif' }}>
                  MidatoPay
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                The merchant's solution to protect against inflation. Accept fiat, receive crypto.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-white font-semibold mb-4" style={{ fontFamily: 'Kufam, sans-serif' }}>
                Product
              </h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/anotate" className="text-gray-400 hover:text-white transition-colors">Join Waitlist</Link></li>
                <li><Link href="/aprende" className="text-gray-400 hover:text-white transition-colors">Learn</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4" style={{ fontFamily: 'Kufam, sans-serif' }}>
                Support
              </h3>
              <ul className="space-y-2">
                <li><Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/auth/register" className="text-gray-400 hover:text-white transition-colors">Register</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 MidatoPay. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}
