'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'

const languages = [
  { code: 'en', name: 'English', flag: '/lenguajes/eeuu.svg' },
  { code: 'es', name: 'Español', flag: '/lenguajes/ar.svg' },
  { code: 'it', name: 'Italiano', flag: '/lenguajes/it.svg' },
  { code: 'pt', name: 'Português', flag: '/lenguajes/br.svg' },
  { code: 'cn', name: '中文', flag: '/lenguajes/cn.svg' },
]

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLanguageChange = (langCode: 'es' | 'en' | 'it' | 'pt' | 'cn') => {
    setLanguage(langCode)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón del selector */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:bg-white hover:bg-opacity-20"
        style={{
          backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
          fontFamily: 'Kufam, sans-serif',
        }}
      >
        <Image
          src={currentLanguage.flag}
          alt={currentLanguage.name}
          width={20}
          height={15}
          className="object-contain rounded-sm"
        />
        <span className="text-sm font-medium text-white uppercase hidden sm:inline">
          {currentLanguage.code}
        </span>
        <svg
          className={`w-4 h-4 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-48 rounded-lg shadow-lg overflow-hidden z-[70]"
          style={{
            backgroundColor: 'rgba(255, 106, 0, 0.98)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code as 'es' | 'en' | 'it' | 'pt' | 'cn')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 hover:bg-white hover:bg-opacity-20 ${
                language === lang.code ? 'bg-white bg-opacity-15' : ''
              }`}
              style={{ fontFamily: 'Kufam, sans-serif' }}
            >
              <Image
                src={lang.flag}
                alt={lang.name}
                width={20}
                height={15}
                className="object-contain rounded-sm flex-shrink-0"
              />
              <span className="text-sm font-medium text-white flex-1">{lang.name}</span>
              <span className="text-xs text-gray-300 uppercase">{lang.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

