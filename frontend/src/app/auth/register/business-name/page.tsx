'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function BusinessNamePage() {
  // Página deshabilitada - redirigir a registro manual
  const router = useRouter()
  
  useEffect(() => {
    toast('Esta página está deshabilitada. Por favor, usa el registro manual.')
    router.push('/auth/register')
  }, [router])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo al registro...</p>
      </div>
    </div>
  )
}
