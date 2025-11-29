'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/store/auth'

interface WebSocketMessage {
  type: string
  data?: any
  timestamp: string
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { token, isAuthenticated } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5
  } = options

  const connect = () => {
    if (!isAuthenticated || !token) {
      return
    }

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3002'
      const url = `${wsUrl}/ws?token=${encodeURIComponent(token)}`
      
      wsRef.current = new WebSocket(url)

      wsRef.current.onopen = () => {
        setIsConnected(true)
        setError(null)
        reconnectAttemptsRef.current = 0
        onOpen?.()
      }

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          onMessage?.(message)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      wsRef.current.onclose = () => {
        setIsConnected(false)
        onClose?.()
        
        // Intentar reconectar si no fue un cierre intencional
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        }
      }

      wsRef.current.onerror = (error) => {
        setError('Error de conexión WebSocket')
        onError?.(error)
      }

    } catch (error) {
      setError('Error al conectar WebSocket')
      console.error('WebSocket connection error:', error)
    }
  }

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setIsConnected(false)
  }

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      return true
    }
    return false
  }

  const ping = () => {
    return sendMessage({ type: 'ping' })
  }

  const subscribeToPayment = (paymentId: string) => {
    return sendMessage({ 
      type: 'subscribe_payment', 
      paymentId 
    })
  }

  const unsubscribeFromPayment = (paymentId: string) => {
    return sendMessage({ 
      type: 'unsubscribe_payment', 
      paymentId 
    })
  }

  useEffect(() => {
    if (isAuthenticated && token) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [isAuthenticated, token])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [])

  return {
    isConnected,
    error,
    sendMessage,
    ping,
    subscribeToPayment,
    unsubscribeFromPayment,
    connect,
    disconnect
  }
}
