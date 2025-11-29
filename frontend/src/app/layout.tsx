import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ClerkProvider } from '@/components/providers/ClerkProvider'
import { LanguageProvider } from '@/contexts/LanguageContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'MidatoPay - El Presente y el Futuro de tus pagos',
  description: 'Sistema de pagos que permite a comercios recibir pagos en pesos argentinos y convertirlos automáticamente en criptomonedas.',
  keywords: ['pagos', 'criptomonedas', 'USDT', 'Bitcoin', 'Ethereum', 'Argentina', 'ARS'],
  authors: [{ name: 'MidatoPay Team' }],
  icons: {
    icon: '/midatopay.svg',
    shortcut: '/midatopay.svg',
    apple: '/midatopay.svg',
  },
  openGraph: {
    title: 'MidatoPay - El Presente y el Futuro de tus pagos',
    description: 'Recibe pagos en pesos argentinos y conviértelos automáticamente en criptomonedas',
    type: 'website',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MidatoPay - El Presente y el Futuro de tus pagos',
    description: 'Recibe pagos en pesos argentinos y conviértelos automáticamente en criptomonedas',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#667eea',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider>
          <LanguageProvider>
            <AuthProvider>
              {children}
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#FFFFFF',
                    color: '#2C2C2C',
                    border: '2px solid #FF6A00',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    fontFamily: 'Kufam, sans-serif',
                    fontSize: '16px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    maxWidth: '500px'
                  },
                  success: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#FF6A00',
                      secondary: '#FFFFFF',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#FF6A00',
                      secondary: '#FFFFFF',
                    },
                  },
                }}
              />
            </AuthProvider>
          </LanguageProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
