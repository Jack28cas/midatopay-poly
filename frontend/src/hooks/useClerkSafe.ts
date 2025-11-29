'use client'

/**
 * Hook que verifica si Clerk está configurado
 * NO usa hooks de Clerk para evitar errores cuando ClerkProvider no está presente
 */
export function useClerkSafe() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const isClerkConfigured = publishableKey && 
    publishableKey.trim() !== '' && 
    publishableKey !== 'pk_test_placeholder' &&
    publishableKey !== 'pk_test_invalid_placeholder' &&
    publishableKey.startsWith('pk_')

  // Retornar solo información de configuración
  // El componente que usa este hook debe usar useSignIn() directamente
  // solo si isConfigured es true
  return {
    isConfigured: isClerkConfigured
  }
}

