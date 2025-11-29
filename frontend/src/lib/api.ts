import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token de autenticación (Clerk o JWT tradicional)
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      // Intentar obtener token de Clerk primero
      try {
        // Verificar si Clerk está disponible
        const { useUser } = await import('@clerk/nextjs')
        // Esto no funcionará aquí porque no podemos usar hooks en un interceptor
        // En su lugar, usaremos una función helper
      } catch {
        // Clerk no disponible, continuar con JWT tradicional
      }

      // Intentar obtener token JWT tradicional
      const authData = localStorage.getItem('auth-storage')
      if (authData) {
        try {
          const parsed = JSON.parse(authData)
          const token = parsed.state?.token
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        } catch (error) {
          console.error('Error parsing auth data:', error)
        }
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage')
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

// API de autenticación
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  
  register: (userData: any) =>
    api.post('/api/auth/register', userData),
  
  getProfile: () =>
    api.get('/api/auth/profile'),
  
  updateProfile: (userData: any) =>
    api.put('/api/auth/profile', userData),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/api/auth/change-password', { currentPassword, newPassword }),
}

// API de pagos
export const paymentsAPI = {
  create: (paymentData: any) =>
    api.post('/api/payments/create', paymentData),
  
  getByQR: (qrId: string) =>
    api.get(`/api/payments/qr/${qrId}`),
  
  getMyPayments: (params?: any) =>
    api.get('/api/payments/my-payments', { params }),
  
  getById: (paymentId: string) =>
    api.get(`/api/payments/${paymentId}`),
  
  cancel: (paymentId: string) =>
    api.put(`/api/payments/${paymentId}/cancel`),
}

// API de transacciones
export const transactionsAPI = {
  create: (transactionData: any) =>
    api.post('/api/transactions/create', transactionData),
  
  confirm: (transactionId: string, txHash: string) =>
    api.post(`/api/transactions/${transactionId}/confirm`, { txHash }),
  
  getStatus: (transactionId: string) =>
    api.get(`/api/transactions/${transactionId}/status`),
  
  getMyTransactions: (params?: any) =>
    api.get('/api/transactions/my-transactions', { params }),
}

// API del oráculo de precios
export const oracleAPI = {
  getPrice: (currency: string, baseCurrency: string = 'ARS') =>
    api.get(`/api/oracle/price/${currency}`, { 
      params: { baseCurrency } 
    }),
  
  getPrices: (baseCurrency: string = 'ARS') =>
    api.get('/api/oracle/prices', { 
      params: { baseCurrency } 
    }),
  
  getAveragePrice: (currency: string, baseCurrency: string = 'ARS') =>
    api.get(`/api/oracle/average/${currency}`, { 
      params: { baseCurrency } 
    }),
  
  getPriceHistory: (currency: string, baseCurrency: string = 'ARS', hours: number = 24) =>
    api.get(`/api/oracle/history/${currency}`, { 
      params: { baseCurrency, hours } 
    }),
  
  convert: (amount: number, fromCurrency: string, toCurrency: string) =>
    api.post('/api/oracle/convert', { 
      amount, 
      fromCurrency, 
      toCurrency 
    }),
}

// API de utilidades
export const utilsAPI = {
  health: () =>
    api.get('/health'),
}

export default api
