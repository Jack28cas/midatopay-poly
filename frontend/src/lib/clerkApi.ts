/**
 * Helper para hacer requests al API usando el token de Clerk
 * 
 * Este helper obtiene el token de sesión de Clerk y lo usa en las requests
 */

export async function getClerkToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null

  try {
    // Importar dinámicamente para evitar errores si Clerk no está disponible
    const { useUser } = await import('@clerk/nextjs')
    // Nota: No podemos usar hooks aquí, así que esto se manejará en los componentes
    return null
  } catch {
    return null
  }
}

/**
 * Hacer fetch con token de Clerk
 */
export async function fetchWithClerkToken(
  url: string,
  options: RequestInit = {},
  getToken: () => Promise<string | null>
): Promise<Response> {
  const token = await getToken()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

