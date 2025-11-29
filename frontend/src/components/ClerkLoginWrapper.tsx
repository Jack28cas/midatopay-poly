'use client'

import { useSignIn } from '@clerk/nextjs'
import { ReactNode } from 'react'

/**
 * Wrapper component que solo renderiza children si Clerk está disponible
 * Esto permite usar hooks de Clerk condicionalmente
 */
interface ClerkLoginWrapperProps {
  children: (clerkHook: ReturnType<typeof useSignIn>) => ReactNode
  fallback?: ReactNode
}

export function ClerkLoginWrapper({ children, fallback = null }: ClerkLoginWrapperProps) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const isClerkConfigured = publishableKey && 
    publishableKey.trim() !== '' && 
    publishableKey !== 'pk_test_placeholder' &&
    publishableKey.startsWith('pk_')

  // Si Clerk no está configurado, retornar fallback
  if (!isClerkConfigured) {
    return <>{fallback}</>
  }

  // Si está configurado, intentar usar Clerk
  // Esto puede fallar si ClerkProvider no está presente
  try {
    const clerkHook = useSignIn()
    return <>{children(clerkHook)}</>
  } catch (error) {
    console.warn('Clerk no está disponible:', error)
    return <>{fallback}</>
  }
}

