'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import esTranslations from '@/locales/es.json'
import enTranslations from '@/locales/en.json'
import itTranslations from '@/locales/it.json'
import ptTranslations from '@/locales/pt.json'
import cnTranslations from '@/locales/cn.json'

type Language = 'es' | 'en' | 'it' | 'pt' | 'cn'

type Translations = typeof esTranslations

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  es: esTranslations,
  en: enTranslations,
  it: itTranslations,
  pt: ptTranslations,
  cn: cnTranslations,
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es')

  // Detectar idioma del navegador al cargar
  useEffect(() => {
    // Obtener idioma guardado en localStorage o detectar del navegador
    const savedLanguage = localStorage.getItem('language') as Language | null
    const browserLanguage = navigator.language.split('-')[0] as Language
    
    if (savedLanguage && ['es', 'en', 'it', 'pt', 'cn'].includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    } else if (['es', 'en', 'it', 'pt', 'cn'].includes(browserLanguage)) {
      setLanguageState(browserLanguage)
    } else {
      // Por defecto español si no se detecta ninguno soportado
      setLanguageState('es')
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    // Actualizar el atributo lang del HTML
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
    }
  }

  // Actualizar lang del HTML cuando cambia el idioma
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
    }
  }, [language])

  const value = {
    language,
    setLanguage,
    t: translations[language],
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

