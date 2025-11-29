import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'ARS' ? 0 : 2,
    maximumFractionDigits: currency === 'ARS' ? 0 : 8,
  }).format(amount)
}

export function formatCryptoAmount(amount: number, currency: string): string {
  const decimals = currency === 'BTC' ? 8 : currency === 'ETH' ? 6 : 6
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'hace un momento'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `hace ${hours} hora${hours > 1 ? 's' : ''}`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `hace ${days} día${days > 1 ? 's' : ''}`
  }
}

export function generateQRData(paymentData: any): string {
  return JSON.stringify({
    id: paymentData.id,
    amount: paymentData.amount,
    currency: paymentData.currency,
    concept: paymentData.concept,
    timestamp: new Date().toISOString(),
    type: 'midatopay_payment'
  })
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false)
  } else {
    // Fallback para navegadores que no soportan clipboard API
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      document.execCommand('copy')
      textArea.remove()
      return Promise.resolve(true)
    } catch (err) {
      textArea.remove()
      return Promise.resolve(false)
    }
  }
}

export function getCryptoIcon(currency: string): string {
  const icons: Record<string, string> = {
    'USDT': '🟢',
    'BTC': '🟠',
    'ETH': '🔵',
    'ARS': '🇦🇷',
    'USD': '🇺🇸'
  }
  return icons[currency] || '💰'
}

export function getCryptoColor(currency: string): string {
  const colors: Record<string, string> = {
    'USDT': 'text-crypto-usdt',
    'BTC': 'text-crypto-btc',
    'ETH': 'text-crypto-eth',
    'ARS': 'text-blue-600',
    'USD': 'text-green-600'
  }
  return colors[currency] || 'text-gray-600'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'PENDING': 'text-yellow-600 bg-yellow-100',
    'CONFIRMED': 'text-green-600 bg-green-100',
    'PAID': 'text-green-600 bg-green-100',
    'FAILED': 'text-red-600 bg-red-100',
    'EXPIRED': 'text-gray-600 bg-gray-100',
    'CANCELLED': 'text-gray-600 bg-gray-100'
  }
  return colors[status] || 'text-gray-600 bg-gray-100'
}

export function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    'PENDING': 'Pendiente',
    'CONFIRMED': 'Confirmado',
    'PAID': 'Pagado',
    'FAILED': 'Fallido',
    'EXPIRED': 'Expirado',
    'CANCELLED': 'Cancelado'
  }
  return texts[status] || status
}
