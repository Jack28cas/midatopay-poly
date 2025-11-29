'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { token, isAuthenticated, setLoading } = useAuthStore()

  useEffect(() => {
    // Verificar si hay un token válido al cargar la aplicación
    if (token && isAuthenticated) {
      // Aquí podrías verificar la validez del token con el servidor
      // Por ahora, simplemente mantenemos el estado
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [token, isAuthenticated, setLoading])

  return <>{children}</>
}
