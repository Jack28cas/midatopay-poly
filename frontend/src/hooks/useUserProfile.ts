'use client'

import { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useAuthStore } from '@/store/auth'

/**
 * Hook para obtener y gestionar el perfil del usuario
 * 
 * Este hook:
 * 1. Detecta si el usuario está autenticado con JWT tradicional o Clerk
 * 2. Obtiene el token apropiado (JWT o Clerk)
 * 3. Llama al backend para obtener el perfil completo
 * 4. El backend crea automáticamente el usuario si no existe (en clerkAuth.js)
 * 5. Verifica si el usuario necesita completar onboarding
 * 6. Verifica si el usuario tiene wallet creada
 */
export function useUserProfile() {
  const { getToken, isSignedIn, isLoaded: isAuthLoaded } = useAuth()
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser()
  const { user: authUser, token: jwtToken, isAuthenticated: isJwtAuthenticated, setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [needsWallet, setNeedsWallet] = useState(false)

  // Cargar perfil del usuario
  const loadProfile = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🔄 useUserProfile: Obteniendo token y cargando perfil...')
      
      // Prioridad 1: Si hay token JWT (registro manual), usarlo
      let token: string | null = null
      let tokenSource = 'unknown'
      
      if (jwtToken && isJwtAuthenticated) {
        token = jwtToken
        tokenSource = 'JWT'
        console.log('✅ Usando token JWT (registro manual)')
      } else if (isAuthLoaded) {
        // Prioridad 2: Si Clerk está cargado, intentar obtener token de Clerk
        try {
          token = await getToken()
          if (token) {
            tokenSource = 'Clerk'
            console.log('✅ Token de Clerk obtenido')
          }
        } catch (err) {
          console.log('⚠️ No se pudo obtener token de Clerk:', err)
        }
      } else {
        console.log('⏳ useUserProfile: Esperando que Clerk termine de cargar...')
        setIsLoading(false)
        return
      }
      
      if (!token) {
        throw new Error('No se pudo obtener el token de autenticación')
      }

      console.log(`✅ Token obtenido (${tokenSource}), llamando al backend...`)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      console.log('📡 useUserProfile: Llamando a API para obtener/crear perfil...')
      const response = await fetch(`${apiUrl}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ useUserProfile: Error en respuesta:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        throw new Error(errorData.message || 'Error al obtener el perfil')
      }

      const data = await response.json()
      const user = data.user

      console.log('✅ useUserProfile: Perfil obtenido del backend:', {
        id: user.id,
        email: user.email,
        name: user.name,
        hasWallet: !!user.walletAddress
      })

      // Actualizar el store de autenticación
      setUser(user)

      // Verificar si necesita onboarding (nombre es genérico o no tiene nombre de negocio)
      // Consideramos que necesita onboarding si el nombre es muy genérico
      const genericNames = ['Usuario', 'Usuario Clerk', 'user', 'User']
      const needsOnboardingCheck = !user.name || 
        genericNames.some(generic => user.name.toLowerCase().includes(generic.toLowerCase())) ||
        user.name === user.email.split('@')[0] // Si el nombre es solo la parte del email

      setNeedsOnboarding(needsOnboardingCheck)
      setNeedsWallet(!user.walletAddress)

      console.log('✅ useUserProfile: Perfil cargado:', {
        email: user.email,
        name: user.name,
        needsOnboarding: needsOnboardingCheck,
        hasWallet: !!user.walletAddress
      })
    } catch (err) {
      console.error('❌ useUserProfile: Error cargando perfil:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar perfil cuando haya autenticación (JWT o Clerk)
  useEffect(() => {
    // Si hay token JWT, cargar perfil inmediatamente
    if (jwtToken && isJwtAuthenticated) {
      console.log('🔄 useUserProfile: Usuario autenticado con JWT, cargando perfil...')
      const timer = setTimeout(() => {
        loadProfile()
      }, 500)
      return () => clearTimeout(timer)
    }

    // Si no hay JWT, esperar a que Clerk termine de cargar
    if (!isAuthLoaded) {
      return
    }

    // Si está autenticado con Clerk, cargar perfil inmediatamente
    if (isSignedIn) {
      const timer = setTimeout(() => {
        loadProfile()
      }, 500)
      return () => clearTimeout(timer)
    }

    // Si no está autenticado pero hay cookies de Clerk, podría ser que la sesión se esté estableciendo
    // Intentar obtener el token de todas formas (con retry)
    const hasClerkCookies = typeof document !== 'undefined' 
      ? document.cookie.split(';').some(c => c.includes('__clerk'))
      : false

    if (hasClerkCookies) {
      console.log('🔄 useUserProfile: Hay cookies de Clerk pero isSignedIn es false, intentando obtener token...')
      
      // Intentar obtener token con retry continuo (hasta 30 intentos, cada 3 segundos = 90 segundos total)
      // Continuar intentando indefinidamente si hay cookies de Clerk
      let retryCount = 0
      const maxRetries = 30 // Aumentar a 30 intentos
      let timeoutId: NodeJS.Timeout | null = null
      let hasStopped = false
      
      const tryLoadProfile = async () => {
        if (hasStopped) return false
        
        try {
          console.log(`🔄 useUserProfile: Intento ${retryCount + 1}/${maxRetries} de obtener token...`)
          const token = await getToken()
          if (token) {
            console.log('✅ useUserProfile: Token obtenido después de retry, cargando perfil...')
            // Limpiar timeout si existe
            if (timeoutId) clearTimeout(timeoutId)
            hasStopped = true
            await loadProfile()
            return true
          } else if (retryCount < maxRetries - 1) {
            retryCount++
            const delay = 3000 // 3 segundos entre intentos (dar más tiempo a Clerk)
            console.log(`⏳ useUserProfile: Reintentando obtener token en ${delay}ms... (intento ${retryCount + 1}/${maxRetries})`)
            timeoutId = setTimeout(tryLoadProfile, delay)
            return false
          } else {
            console.warn('⚠️ useUserProfile: No se pudo obtener token después de 30 intentos')
            console.log('ℹ️ Continuando en segundo plano - el usuario puede seguir usando el dashboard')
            setIsLoading(false)
            hasStopped = true
            return false
          }
        } catch (error) {
          console.error(`❌ useUserProfile: Error en intento ${retryCount + 1}:`, error)
          if (retryCount < maxRetries - 1) {
            retryCount++
            const delay = 2000
            timeoutId = setTimeout(tryLoadProfile, delay)
            return false
          } else {
            setIsLoading(false)
            return false
          }
        }
      }

      // Primer intento después de 2 segundos (dar tiempo a Clerk para establecer la sesión)
      timeoutId = setTimeout(() => {
        tryLoadProfile()
      }, 2000)
      
      return () => {
        if (timeoutId) clearTimeout(timeoutId)
      }
    } else {
      // No hay cookies ni JWT, definitivamente no está autenticado
      setIsLoading(false)
    }
  }, [isAuthLoaded, isSignedIn, jwtToken, isJwtAuthenticated])

  return {
    user: authUser,
    isLoading,
    error,
    needsOnboarding,
    needsWallet,
    reloadProfile: loadProfile
  }
}

