import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  walletAddress?: string
  role: 'MERCHANT' | 'ADMIN'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  hasHydrated: boolean
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<void>
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

interface RegisterData {
  email: string
  password: string
  name: string
  phone?: string
}

type AuthStore = AuthState & AuthActions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasHydrated: false,

      // Acciones
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Error al iniciar sesión')
          }

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
          })
          throw error
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Error al registrarse')
          }

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
          })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      updateProfile: async (userData: Partial<User>) => {
        const { token } = get()
        if (!token) throw new Error('No autenticado')

        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Error al actualizar perfil')
          }

          set({
            user: data.user,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
          })
          throw error
        }
      },

      setUser: (user: User) => {
        set({ user })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Error rehydrating auth store:', error)
          }
          // Marcar como rehidratado cuando termine de cargar desde localStorage
          // Usar setTimeout para asegurar que el estado se actualice después de la rehidratación
          setTimeout(() => {
            if (state) {
              useAuthStore.setState({ hasHydrated: true })
            }
          }, 0)
        }
      },
    }
  )
)

// Hook para verificar autenticación
export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, hasHydrated } = useAuthStore()
  
  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    hasHydrated,
    isMerchant: user?.role === 'MERCHANT',
    isAdmin: user?.role === 'ADMIN',
  }
}

// Hook para acciones de autenticación
export const useAuthActions = () => {
  const {
    login,
    register,
    logout,
    updateProfile,
    setUser,
    setLoading,
    setError,
    clearError,
  } = useAuthStore()
  
  return {
    login,
    register,
    logout,
    updateProfile,
    setUser,
    setLoading,
    setError,
    clearError,
  }
}
