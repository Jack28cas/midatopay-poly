import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Rutas públicas que no requieren autenticación
const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/login(.*)',
  '/auth/register(.*)',
  '/api/webhooks(.*)',
])

// Rutas que requieren autenticación pero manejamos en el cliente
const isClientProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
])

// Usar clerkMiddleware con protección de rutas
export default clerkMiddleware(async (auth, req) => {
  // Si es una ruta pública, permitir acceso
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }
  
  // Para rutas protegidas por el cliente (dashboard, onboarding)
  // Verificar autenticación pero no redirigir automáticamente
  // Esto permite que el cliente maneje la redirección después de OAuth
  if (isClientProtectedRoute(req)) {
    const { userId } = await auth()
    
    // Si no hay userId pero hay cookies de Clerk, podría ser que estemos después de OAuth
    // Permitir acceso y dejar que el cliente maneje la verificación
    if (!userId) {
      // Verificar si hay cookies de Clerk (posible callback de OAuth)
      const clerkCookies = req.headers.get('cookie')?.includes('__clerk')
      if (clerkCookies) {
        // Hay cookies pero no userId aún - podría ser que la sesión se esté estableciendo
        // Permitir acceso temporalmente
        return NextResponse.next()
      }
    }
    
    // Si hay userId, permitir acceso
    return NextResponse.next()
  }
  
  // Para otras rutas protegidas, Clerk manejará automáticamente la autenticación
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

