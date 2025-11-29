'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSelector from './LanguageSelector'

export default function CustomHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
        <header 
          className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
            isScrolled ? 'py-2' : 'py-3'
          }`}
          style={{
            background: isScrolled 
              ? 'rgba(255, 106, 0, 0.9)' 
              : 'rgba(255, 106, 0, 0.95)',
            backdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: isScrolled 
              ? '0 8px 32px rgba(0, 0, 0, 0.2)' 
              : '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}
        >
      <div className="w-full px-4 sm:px-6">
        <nav className="flex items-center justify-between w-full">
          {/* Logo - Completamente a la izquierda */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Image 
                  src="/logo.png" 
                  alt="MidatoPay Logo" 
                  width={isScrolled ? 24 : 28} 
                  height={isScrolled ? 24 : 28}
                  className="object-contain transition-all duration-300 sm:w-7 sm:h-7"
                />
              </div>
              <h1 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'Kufam, sans-serif', color: '#FFFFFF' }}>
                MidatoPay
              </h1>
            </Link>
          </div>

          {/* Menú Central - Desktop */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link 
              href="/" 
              className="text-sm xl:text-base font-medium transition-all duration-300 hover:text-white hover:scale-105 whitespace-nowrap"
              style={{ fontFamily: 'Kufam, sans-serif', color: '#FFFFFF' }}
            >
              {t.header.home}
            </Link>
            <Link 
              href="/lista-de-espera" 
              className="text-sm xl:text-base font-medium transition-all duration-300 hover:text-white hover:scale-105 whitespace-nowrap"
              style={{ fontFamily: 'Kufam, sans-serif', color: '#FFFFFF' }}
            >
              {t.header.joinWaitlist}
            </Link>
            <Link 
              href="/noticias" 
              className="text-sm xl:text-base font-medium transition-all duration-300 hover:text-white hover:scale-105 whitespace-nowrap"
              style={{ fontFamily: 'Kufam, sans-serif', color: '#FFFFFF' }}
            >
              {t.header.news}
            </Link>
          </div>

          {/* Botones Derecha - Completamente a la derecha */}
          <div className="hidden sm:flex items-center space-x-3 md:space-x-4 ml-auto">
            <LanguageSelector />
            <Link 
              href="/auth/login"
              className="px-3 md:px-5 py-2 text-sm md:text-base font-medium transition-all duration-300 hover:text-white hover:scale-105 whitespace-nowrap"
              style={{ fontFamily: 'Kufam, sans-serif', color: '#FFFFFF' }}
            >
              {t.header.login}
            </Link>
            <Link 
              href="/auth/register"
              className="px-3 md:px-5 py-2 bg-white text-orange-500 text-sm md:text-base font-medium rounded-full transition-all duration-300 hover:bg-gray-100 hover:scale-105 hover:shadow-lg flex items-center gap-1 md:gap-2 whitespace-nowrap"
              style={{ fontFamily: 'Kufam, sans-serif' }}
            >
              <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden sm:inline">{t.header.signUp}</span>
              <span className="sm:hidden">Sign</span>
            </Link>
          </div>

          {/* Menú Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg transition-all duration-300 hover:bg-white hover:bg-opacity-20"
              style={{ color: '#FFFFFF' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Menú Mobile Desplegable */}
            {isMenuOpen && (
              <div 
                className="md:hidden mt-4 py-4 border-t border-white border-opacity-20 transition-all duration-300 relative z-[65]"
                style={{
                  background: 'rgba(255, 106, 0, 0.95)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  borderRadius: '0 0 16px 16px'
                }}
              >
            <div className="flex flex-col space-y-4 px-2">
              <Link 
                href="/" 
                className="text-base font-medium transition-all duration-300 hover:text-white hover:scale-105"
                style={{ fontFamily: 'Kufam, sans-serif', color: '#FFFFFF' }}
                onClick={() => setIsMenuOpen(false)}
              >
                {t.header.home}
              </Link>
              <Link 
                href="/lista-de-espera" 
                className="text-base font-medium transition-all duration-300 hover:text-white hover:scale-105"
                style={{ fontFamily: 'Kufam, sans-serif', color: '#FFFFFF' }}
                onClick={() => setIsMenuOpen(false)}
              >
                {t.header.joinWaitlist}
              </Link>
              <Link 
                href="/noticias" 
                className="text-base font-medium transition-all duration-300 hover:text-white hover:scale-105"
                style={{ fontFamily: 'Kufam, sans-serif', color: '#FFFFFF' }}
                onClick={() => setIsMenuOpen(false)}
              >
                {t.header.news}
              </Link>
              
              {/* Selector de idioma con mejor espaciado */}
              <div className="pt-2 pb-2 border-t border-white border-opacity-20">
                <LanguageSelector />
              </div>
              
              {/* Botones Login y Registrarse en fila horizontal */}
              <div className="flex gap-3 pt-2 border-t border-white border-opacity-20">
                <Link 
                  href="/auth/login"
                  className="flex-1 text-base font-medium bg-transparent border-2 border-white border-opacity-30 text-white px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-white hover:bg-opacity-20 hover:scale-105 text-center"
                  style={{ fontFamily: 'Kufam, sans-serif' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t.header.login}
                </Link>
                <Link 
                  href="/auth/register"
                  className="flex-1 text-base font-medium bg-white text-orange-500 px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-gray-100 hover:scale-105 hover:shadow-lg text-center flex items-center justify-center gap-2"
                  style={{ fontFamily: 'Kufam, sans-serif' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t.header.signUp}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
