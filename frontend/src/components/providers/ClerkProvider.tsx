'use client'

import { ClerkProvider as ClerkProviderBase } from '@clerk/nextjs'

interface ClerkProviderProps {
  children: React.ReactNode
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  // Obtener la clave desde las variables de entorno del cliente
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  // Verificar si hay una clave válida
  const hasValidKey = publishableKey && 
    publishableKey.trim() !== '' && 
    publishableKey !== 'pk_test_placeholder' &&
    publishableKey.startsWith('pk_')

  if (!hasValidKey) {
    console.warn(
      '⚠️ Clerk Publishable Key no configurada.\n' +
      'Agrega NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY a tu archivo .env.local\n' +
      'Ejemplo: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...\n' +
      'Obtén tu clave en: https://dashboard.clerk.com\n' +
      'El login con Google no estará disponible hasta que configures la clave.'
    )
  }

  // Solo renderizar el provider si hay una clave válida
  // Si no hay clave, no renderizamos el provider y los hooks de Clerk no estarán disponibles
  // El componente de login debe verificar isConfigured antes de usar los hooks
  if (!hasValidKey) {
    // Retornar children sin el provider
    // Los componentes que usan hooks de Clerk deben manejar este caso
    return <>{children}</>
  }

  // Renderizar el provider solo con una clave válida
  return (
    <ClerkProviderBase 
      publishableKey={publishableKey}
      signInUrl="/auth/login"
      signUpUrl="/auth/register"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      {children}
    </ClerkProviderBase>
  )
}

