// API service para MidatoPay
class MidatoPayAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getAuthToken();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en la solicitud');
    }

    return response.json();
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.token || null;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    
    return null;
  }

  // Generar QR de pago
  async generatePaymentQR(data: {
    amountARS: number;
    targetCrypto: string;
  }) {
    return this.request('/api/midatopay/generate-qr', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Obtener historial de pagos
  async getPaymentHistory(limit: number = 50) {
    return this.request(`/api/midatopay/payment-history?limit=${limit}`);
  }

  // Obtener estadísticas del comercio
  async getMerchantStats() {
    return this.request('/api/midatopay/stats');
  }

  // Escanear QR
  async scanQR(qrData: string) {
    return this.request('/api/midatopay/scan-qr', {
      method: 'POST',
      body: JSON.stringify({ qrData }),
    });
  }

  // Obtener información de sesión
  async getPaymentSession(sessionId: string) {
    return this.request(`/api/midatopay/session/${sessionId}`);
  }
}

export const midatoPayAPI = new MidatoPayAPI();
