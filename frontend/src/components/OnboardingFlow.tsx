'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useUser, useAuth } from '@clerk/nextjs'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Store, Wallet, CheckCircle } from 'lucide-react'
import { useUserProfile } from '@/hooks/useUserProfile'

/**
 * Componente de onboarding para nuevos usuarios
 * 
 * Flujo:
 * 1. Pedir nombre del negocio/comercio
 * 2. Crear wallet automáticamente
 * 3. Redirigir al dashboard
 */
export function OnboardingFlow() {
  const router = useRouter()
  const { user: clerkUser } = useUser()
  const { getToken } = useAuth()
  const { reloadProfile } = useUserProfile()
  const [step, setStep] = useState<'business-name' | 'creating-wallet' | 'complete'>('business-name')
  const [businessName, setBusinessName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  // Obtener token de Clerk
  const getClerkToken = async (): Promise<string | null> => {
    if (!clerkUser) return null
    try {
      return await getToken()
    } catch (error) {
      console.error('Error obteniendo token:', error)
      return null
    }
  }

  // Paso 1: Guardar nombre del negocio
  const handleSaveBusinessName = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!businessName.trim() || businessName.trim().length < 2) {
      toast.error('El nombre del negocio debe tener al menos 2 caracteres')
      return
    }

    setIsSubmitting(true)

    try {
      const token = await getClerkToken()
      if (!token) {
        throw new Error('No se pudo obtener el token de autenticación')
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      
      // Actualizar nombre del negocio
      const response = await fetch(`${apiUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: businessName.trim() })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        throw new Error(errorData.error || 'Error al guardar el nombre del negocio')
      }

      toast.success('Nombre del negocio guardado')
      
      // Pasar al siguiente paso: crear wallet
      setStep('creating-wallet')
      await handleCreateWallet()
    } catch (error) {
      console.error('Error guardando nombre:', error)
      toast.error(error instanceof Error ? error.message : 'Error al guardar el nombre')
      setIsSubmitting(false)
    }
  }

  // Paso 2: Crear wallet automáticamente
  const handleCreateWallet = async () => {
    try {
      const token = await getClerkToken()
      if (!token) {
        throw new Error('No se pudo obtener el token de autenticación')
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      
      // Crear wallet automáticamente
      const response = await fetch(`${apiUrl}/api/auth/create-wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        throw new Error(errorData.error || 'Error al crear la wallet')
      }

      const data = await response.json()
      setWalletAddress(data.user.walletAddress)
      
      toast.success('Wallet creada exitosamente')
      
      // Recargar perfil para actualizar el estado
      await reloadProfile()
      
      // Pasar al paso final
      setStep('complete')
      
      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Error creando wallet:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear la wallet')
      setIsSubmitting(false)
      setStep('business-name') // Volver al paso anterior
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FFF4EC' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card style={{ 
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(255, 106, 0, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2" style={{ fontFamily: 'Kufam, sans-serif', color: '#FF6A00' }}>
              {step === 'business-name' && <Store className="w-6 h-6" />}
              {step === 'creating-wallet' && <Wallet className="w-6 h-6" />}
              {step === 'complete' && <CheckCircle className="w-6 h-6" />}
              <span>
                {step === 'business-name' && 'Configura tu Negocio'}
                {step === 'creating-wallet' && 'Creando tu Wallet'}
                {step === 'complete' && '¡Todo Listo!'}
              </span>
            </CardTitle>
            <CardDescription style={{ fontFamily: 'Kufam, sans-serif', color: '#8B8B8B' }}>
              {step === 'business-name' && 'Completa tu información para comenzar'}
              {step === 'creating-wallet' && 'Estamos creando tu wallet de forma segura...'}
              {step === 'complete' && 'Tu cuenta está lista para usar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'business-name' && (
              <form onSubmit={handleSaveBusinessName} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName" style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}>
                    Nombre de tu Negocio
                  </Label>
                  <Input
                    id="businessName"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Ej: Café del Barrio, Tienda Online, etc."
                    minLength={2}
                    required
                    style={{ 
                      backgroundColor: 'rgba(247, 247, 246, 0.8)', 
                      border: '1px solid rgba(255,106,0,0.2)',
                      fontFamily: 'Kufam, sans-serif'
                    }}
                  />
                  <p className="text-xs" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif' }}>
                    Este será el nombre que verán tus clientes
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || businessName.trim().length < 2}
                  className="w-full"
                  style={{ 
                    backgroundColor: '#FF6A00', 
                    color: '#FFFFFF',
                    fontFamily: 'Kufam, sans-serif'
                  }}
                >
                  {isSubmitting ? 'Guardando...' : 'Continuar'}
                </Button>
              </form>
            )}

            {step === 'creating-wallet' && (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                </div>
                <p style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}>
                  Creando tu wallet de forma segura...
                </p>
                <p className="text-sm" style={{ fontFamily: 'Kufam, sans-serif', color: '#8B8B8B' }}>
                  Esto solo tomará unos segundos
                </p>
              </div>
            )}

            {step === 'complete' && (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16" style={{ color: '#10B981' }} />
                </div>
                <h3 className="text-xl font-semibold" style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}>
                  ¡Bienvenido a MidatoPay!
                </h3>
                <p style={{ fontFamily: 'Kufam, sans-serif', color: '#8B8B8B' }}>
                  Tu negocio <strong style={{ color: '#FF6A00' }}>{businessName}</strong> está configurado
                </p>
                {walletAddress && (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                    <p className="text-xs font-medium mb-1" style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}>
                      Wallet creada:
                    </p>
                    <p className="text-xs font-mono break-all" style={{ fontFamily: 'Kufam, sans-serif', color: '#8B8B8B' }}>
                      {walletAddress}
                    </p>
                  </div>
                )}
                <p className="text-sm" style={{ fontFamily: 'Kufam, sans-serif', color: '#8B8B8B' }}>
                  Redirigiendo al dashboard...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

