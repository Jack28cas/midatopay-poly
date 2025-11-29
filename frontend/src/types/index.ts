// Tipos de usuario
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: 'MERCHANT' | 'ADMIN'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Tipos de pago
export interface Payment {
  id: string
  amount: number
  currency: string
  concept: string
  orderId?: string
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED'
  qrCode: string
  expiresAt: string
  createdAt: string
  updatedAt: string
  userId: string
  user?: User
  transactions?: Transaction[]
}

// Tipos de transacción
export interface Transaction {
  id: string
  paymentId: string
  amount: number
  currency: string
  exchangeRate?: number
  finalAmount?: number
  finalCurrency?: string
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'EXPIRED'
  blockchainTxHash?: string
  walletAddress?: string
  confirmationCount: number
  requiredConfirmations: number
  createdAt: string
  updatedAt: string
  userId: string
  user?: User
  payment?: Payment
}

// Tipos de opciones de pago
export interface PaymentOption {
  currency: string
  amount: string
  rate: number
  source: string
  validFor?: number
}

// Tipos de precios del oráculo
export interface PriceData {
  currency: string
  baseCurrency: string
  price: number
  source: string
  timestamp: string
  validFor?: number
}

export interface PriceHistory {
  price: number
  source: string
  timestamp: string
}

// Tipos de respuesta de la API
export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
  code?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Tipos de formularios
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  phone?: string
}

export interface CreatePaymentForm {
  amount: number
  concept: string
  orderId?: string
  currency: 'ARS' | 'USD'
}

export interface CreateTransactionForm {
  paymentId: string
  currency: string
  amount: number
}

// Tipos de estado
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface PaymentState {
  payments: Payment[]
  currentPayment: Payment | null
  isLoading: boolean
  error: string | null
}

export interface TransactionState {
  transactions: Transaction[]
  currentTransaction: Transaction | null
  isLoading: boolean
  error: string | null
}

export interface PriceState {
  prices: Record<string, PriceData>
  isLoading: boolean
  error: string | null
}

// Tipos de WebSocket
export interface WebSocketMessage {
  type: string
  data?: any
  timestamp: string
}

export interface PaymentUpdateMessage extends WebSocketMessage {
  type: 'payment_update'
  paymentId: string
  update: any
}

export interface TransactionUpdateMessage extends WebSocketMessage {
  type: 'transaction_update'
  transactionId: string
  update: any
}

export interface PriceUpdateMessage extends WebSocketMessage {
  type: 'price_update'
  currency: string
  price: number
  source: string
}

// Tipos de configuración
export interface AppConfig {
  apiUrl: string
  wsUrl?: string
  appName: string
  version: string
  enableAnalytics: boolean
  enableDebug: boolean
}

// Tipos de errores
export interface ApiError {
  message: string
  code?: string
  details?: any
  status?: number
}

// Tipos de validación
export interface ValidationError {
  field: string
  message: string
}

// Tipos de notificaciones
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
}

// Tipos de estadísticas
export interface DashboardStats {
  totalPayments: number
  pendingPayments: number
  completedPayments: number
  totalAmount: number
  totalTransactions: number
  averageTransactionAmount: number
}

// Tipos de filtros
export interface PaymentFilters {
  status?: string
  currency?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface TransactionFilters {
  status?: string
  currency?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}
