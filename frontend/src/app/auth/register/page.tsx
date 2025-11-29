'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
// Clerk deshabilitado temporalmente
// import { useSignUp, useAuth } from '@clerk/nextjs'
// import { useClerkSafe } from '@/hooks/useClerkSafe'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth as useLocalAuth, useAuthActions, useAuthStore } from '@/store/auth'
import { useLanguage } from '@/contexts/LanguageContext'
import { ArrowLeft } from 'lucide-react'

// Google Logo Component  
const GoogleLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.37-4.52H2.18v2.84A9.95 9.95 0 0012 23z"
      fill="#34A853"
    />
    <path
      d="M5.63 13.01c-.22-.66-.35-1.36-.35-2.06s.13-1.4.35-2.06V6.05H2.18C1.43 7.44 1 8.97 1 10.5s.43 3.06 1.18 4.45l3.45-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.02 1 2.7 4.63 1.18 9.45l3.45 2.84C5.71 9.22 8.14 5.38 12 5.38z"
      fill="#EA4335"
    />
  </svg>
);

export default function RegisterPage() {
  const { t } = useLanguage()
  const [registerStep, setRegisterStep] = useState<'basic' | 'password'>('basic')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [basicData, setBasicData] = useState({ name: '', email: '' })
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoading } = useLocalAuth()
  const error = useAuthStore((state) => state.error)
  const { register: registerUser, clearError } = useAuthActions()
  // Clerk deshabilitado temporalmente - usando solo registro manual
  // const { isConfigured: isClerkConfigured } = useClerkSafe()
  // const clerkHook = useSignUp()
  // const { isSignedIn: isClerkSignedIn } = useAuth()
  // const signUp = isClerkConfigured ? clerkHook.signUp : null
  // const isClerkLoaded = isClerkConfigured ? clerkHook.isLoaded : false
  const [isSocialLoading, setIsSocialLoading] = useState(false)
  
  // Redirección automática deshabilitada - usar solo registro manual
  // useEffect(() => {
  //   if (isClerkConfigured && isClerkLoaded && isClerkSignedIn) {
  //     console.log('✅ Usuario ya autenticado con Clerk, redirigiendo a página de nombre del negocio...')
  //     router.push('/auth/register/business-name')
  //   }
  // }, [isClerkConfigured, isClerkLoaded, isClerkSignedIn, router])

  // Esquema completo para validación final
  const registerSchema = z.object({
    name: z.string().min(2, t.auth.register.errors.nameMin),
    email: z.string().email(t.auth.register.errors.invalidEmail),
    phone: z.string().optional(),
    password: z.string().min(6, t.auth.register.errors.passwordMin),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t.auth.register.errors.passwordsDontMatch,
    path: ["confirmPassword"],
  })
  
  // Esquema solo para el paso de password (name y email ya están validados)
  const passwordSchema = z.object({
    password: z.string().min(6, t.auth.register.errors.passwordMin),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t.auth.register.errors.passwordsDontMatch,
    path: ["confirmPassword"],
  })

  type RegisterForm = z.infer<typeof registerSchema>
  type PasswordForm = z.infer<typeof passwordSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<RegisterForm | PasswordForm>({
    resolver: zodResolver(registerStep === 'password' ? passwordSchema : registerSchema),
  })
  
  // Reinicializar el formulario cuando cambia el paso
  useEffect(() => {
    if (registerStep === 'password') {
      reset() // Limpiar el formulario al cambiar al paso de password
    }
  }, [registerStep, reset])
  
  // Observar los valores del formulario para debugging
  const formValues = watch()

  const handleBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    
    if (!name || name.length < 2) {
      toast.error(t.auth.register.errors.nameMin)
      return
    }
    
    if (!email || !email.includes('@') || !email.includes('.')) {
      toast.error(t.auth.register.errors.invalidEmail)
      return
    }
    
    setBasicData({ name, email })
    setRegisterStep('password')
    clearError()
  }

  const handleBackToBasic = () => {
    setRegisterStep('basic')
    clearError()
  }

  // Registro social deshabilitado temporalmente
  const handleSocialRegister = async (provider: 'apple' | 'google') => {
    toast('El registro con Google está temporalmente deshabilitado. Por favor, usa el registro manual.')
  }

  const onSubmit = async (data: RegisterForm | PasswordForm) => {
    console.log('🔄 Iniciando registro...', { data, basicData, registerStep })
    try {
      clearError()
      
      // En el paso de password, solo tenemos password y confirmPassword
      // Combinar con basicData que ya tiene name y email
      const { confirmPassword, ...userData } = data as any
      const finalData = { 
        ...basicData, 
        ...userData,
        // Asegurar que name y email estén presentes desde basicData
        name: basicData.name,
        email: basicData.email
      }
      
      console.log('📤 Enviando datos al backend:', finalData)
      
      await registerUser(finalData)
      
      console.log('✅ Registro exitoso, redirigiendo al dashboard...')
      toast.success(t.auth.register.accountCreated)
      router.push('/dashboard')
    } catch (error) {
      console.error('❌ Error en registro:', error)
      const errorMessage = error instanceof Error ? error.message : t.auth.register.errors.registering
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF4EC' }}>
      {/* Header fijo en la parte superior de toda la página */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4" style={{ backgroundColor: '#FFF4EC' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="MidatoPay Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}>
              Midato<span style={{ color: '#FF6A00' }}>Pay</span>
            </h1>
          </div>
          
          <Link href="/" className="inline-flex items-center space-x-2 transition-colors" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif' }}>
            <ArrowLeft className="w-4 h-4" />
            <span>{t.auth.register.backToHome}</span>
          </Link>
        </div>
      </div>

      {/* Contenido principal centrado */}
      <div className="flex items-center justify-center min-h-screen p-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-bold" style={{ fontFamily: 'Kufam, sans-serif', color: '#FF6A00' }}>
              {t.auth.register.title}
            </h2>
          </div>

          <div 
            className="rounded-2xl p-8 shadow-xl"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(255, 106, 0, 0.1)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
            }}
          >
            {registerStep === 'basic' && (
              <form onSubmit={handleBasicSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2C2C2C', fontFamily: 'Kufam, sans-serif' }}>
                    {t.auth.register.fullName}
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={t.auth.register.fullNamePlaceholder}
                    className="w-full h-12 pl-4 pr-4 text-base rounded-lg border border-orange-200 focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00]"
                    style={{ 
                      backgroundColor: '#FFFFFF', 
                      color: '#2C2C2C',
                      fontFamily: 'Kufam, sans-serif'
                    }}
                  />
                  {error && (
                    <p className="text-sm text-red-400 mt-2" style={{ fontFamily: 'Kufam, sans-serif' }}>{error}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2C2C2C', fontFamily: 'Kufam, sans-serif' }}>
                    {t.auth.register.email}
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t.auth.register.emailPlaceholder}
                      className="w-full h-12 pl-4 pr-4 text-base rounded-lg border border-orange-200 focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00]"
                      style={{ 
                        backgroundColor: '#FFFFFF', 
                        color: '#2C2C2C',
                        fontFamily: 'Kufam, sans-serif'
                      }}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-lg border-0"
                  style={{ 
                    backgroundColor: '#FF6A00', 
                    color: '#FFFFFF',
                    fontFamily: 'Kufam, sans-serif',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  {t.auth.login.continue}
                </Button>
              </form>
            )}

            {registerStep === 'password' && (
              <form onSubmit={handleSubmit(onSubmit, (errors) => {
                console.error('❌ Errores de validación:', errors)
                console.log('📊 Datos del formulario:', formValues)
                if (Object.keys(errors).length > 0) {
                  toast.error('Por favor, completa todos los campos correctamente')
                }
              })}>
                <div className="mb-4 space-y-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#FFF9F5' }}>
                    <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif' }}>{t.auth.register.name}</p>
                    <div className="flex items-center justify-between">
                      <p className="font-medium" style={{ color: '#2C2C2C', fontFamily: 'Kufam, sans-serif' }}>{basicData.name}</p>
                      <button
                        type="button"
                        onClick={handleBackToBasic}
                        className="text-sm underline"
                        style={{ color: '#FF6A00', fontFamily: 'Kufam, sans-serif' }}
                      >
                        {t.auth.register.change}
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#FFF9F5' }}>
                    <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif' }}>{t.auth.register.email}</p>
                    <div className="flex items-center justify-between">
                      <p className="font-medium" style={{ color: '#2C2C2C', fontFamily: 'Kufam, sans-serif' }}>{basicData.email}</p>
                      <button
                        type="button"
                        onClick={handleBackToBasic}
                        className="text-sm underline"
                        style={{ color: '#FF6A00', fontFamily: 'Kufam, sans-serif' }}
                      >
                        {t.auth.register.change}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2C2C2C', fontFamily: 'Kufam, sans-serif' }}>
                    {t.auth.register.password}
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t.auth.register.passwordPlaceholder}
                      {...register('password')}
                      className="w-full h-12 pl-4 pr-4 text-base rounded-lg border border-orange-200 focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00]"
                      style={{ 
                        backgroundColor: '#FFFFFF', 
                        color: '#2C2C2C',
                        fontFamily: 'Kufam, sans-serif'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                      style={{ color: '#8B8B8B' }}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-400 mt-2" style={{ fontFamily: 'Kufam, sans-serif' }}>{errors.password.message}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2C2C2C', fontFamily: 'Kufam, sans-serif' }}>
                    {t.auth.register.confirmPassword}
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t.auth.register.confirmPasswordPlaceholder}
                      {...register('confirmPassword')}
                      className="w-full h-12 pl-4 pr-4 text-base rounded-lg border border-orange-200 focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00]"
                      style={{ 
                        backgroundColor: '#FFFFFF', 
                        color: '#2C2C2C',
                        fontFamily: 'Kufam, sans-serif'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                      style={{ color: '#8B8B8B' }}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-400 mt-2" style={{ fontFamily: 'Kufam, sans-serif' }}>{errors.confirmPassword.message}</p>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-red-400 mb-4" style={{ fontFamily: 'Kufam, sans-serif' }}>{error}</p>
                )}

                <div className="flex items-center mb-6">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="w-4 h-4 rounded border-orange-200 text-orange-500 focus:ring-orange-500"
                  />
                  <label htmlFor="terms" className="ml-2 text-sm" style={{ color: '#2C2C2C', fontFamily: 'Kufam, sans-serif' }}>
                    {t.auth.register.acceptTerms}{' '}
                    <Link href="/terms" className="text-[#FF6A00] hover:underline">
                      {t.auth.register.termsAndConditions}
                    </Link>{' '}
                    {t.auth.register.andThe}{' '}
                    <Link href="/privacy" className="text-[#FF6A00] hover:underline">
                      {t.auth.register.privacyPolicy}
                    </Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-lg border-0"
                  disabled={isLoading}
                  style={{ 
                    backgroundColor: isLoading ? '#CCCCCC' : '#FF6A00', 
                    color: '#FFFFFF',
                    fontFamily: 'Kufam, sans-serif',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                  onClick={(e) => {
                    console.log('🖱️ Botón Create Account clickeado')
                    console.log('📊 Estado del formulario:', {
                      isLoading,
                      errors,
                      basicData,
                      formValues,
                      hasPassword: !!formValues?.password,
                      hasConfirmPassword: !!formValues?.confirmPassword
                    })
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                      {t.auth.register.creatingAccount}
                    </>
                  ) : (
                    t.auth.register.createAccount
                  )}
                </Button>
              </form>
            )}

            {/* Temporalmente deshabilitado - usar registro manual */}
            {/* {registerStep === 'basic' && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span 
                      style={{ 
                        backgroundColor: '#FFFFFF', 
                        color: '#8B8B8B',
                        fontFamily: 'Kufam, sans-serif'
                      }} 
                      className="px-4"
                    >
                      {t.auth.register.orSignUpWith}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => handleSocialRegister('google')}
                  className="w-full h-12 rounded-lg border border-gray-200 flex items-center justify-center gap-3 mb-3"
                  disabled={isSocialLoading}
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    color: '#2C2C2C',
                    fontFamily: 'Kufam, sans-serif',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  {isSocialLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <GoogleLogo size={20} />
                      {t.auth.register.continueWithGoogle}
                    </>
                  )}
                </Button>
              </>
            )} */}

            <div className="mt-8 text-center">
              <p style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontSize: '14px' }}>
                {t.auth.register.alreadyHaveAccount}{' '}
                <Link
                  href="/auth/login"
                  className="font-medium transition-colors underline-offset-2 hover:underline"
                  style={{ color: '#FF6A00' }}
                >
                  {t.auth.register.loginHere}
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
