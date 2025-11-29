const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

// Almacenar conexiones WebSocket por usuario
const userConnections = new Map();

// Inicializar servidor WebSocket
function initializeWebSocket(server) {
  const wss = new WebSocket.Server({ 
    server,
    path: '/ws'
  });

  wss.on('connection', (ws, req) => {
    console.log('🔌 Nueva conexión WebSocket');
    
    // Autenticación del WebSocket
    const token = req.url.split('token=')[1];
    
    if (!token) {
      ws.close(1008, 'Token requerido');
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;
      
      // Almacenar conexión del usuario
      userConnections.set(userId, ws);
      
      // Enviar mensaje de bienvenida
      sendToUser(userId, {
        type: 'connection_established',
        message: 'Conexión WebSocket establecida',
        timestamp: new Date().toISOString()
      });

      ws.on('close', () => {
        console.log(`🔌 Usuario ${userId} desconectado`);
        userConnections.delete(userId);
      });

      ws.on('error', (error) => {
        console.error(`❌ Error WebSocket para usuario ${userId}:`, error);
        userConnections.delete(userId);
      });

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          handleWebSocketMessage(userId, data);
        } catch (error) {
          console.error('Error procesando mensaje WebSocket:', error);
        }
      });

    } catch (error) {
      console.error('Error autenticando WebSocket:', error);
      ws.close(1008, 'Token inválido');
    }
  });

  console.log('✅ Servidor WebSocket iniciado en /ws');
}

// Enviar mensaje a un usuario específico
function sendToUser(userId, message) {
  const ws = userConnections.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
    return true;
  }
  return false;
}

// Enviar mensaje a múltiples usuarios
function sendToUsers(userIds, message) {
  let sentCount = 0;
  userIds.forEach(userId => {
    if (sendToUser(userId, message)) {
      sentCount++;
    }
  });
  return sentCount;
}

// Manejar mensajes del WebSocket
function handleWebSocketMessage(userId, data) {
  console.log(`📨 Mensaje de usuario ${userId}:`, data);
  
  switch (data.type) {
    case 'ping':
      sendToUser(userId, {
        type: 'pong',
        timestamp: new Date().toISOString()
      });
      break;
      
    case 'subscribe_payment':
      // El usuario se suscribe a actualizaciones de un pago específico
      // En una implementación completa, esto se manejaría con rooms
      sendToUser(userId, {
        type: 'subscription_confirmed',
        paymentId: data.paymentId,
        message: 'Suscrito a actualizaciones del pago',
        timestamp: new Date().toISOString()
      });
      break;
      
    default:
      console.log('Tipo de mensaje no reconocido:', data.type);
  }
}

// Notificar actualización de pago
function notifyPaymentUpdate(paymentId, userId, update) {
  const message = {
    type: 'payment_update',
    paymentId,
    update,
    timestamp: new Date().toISOString()
  };
  
  return sendToUser(userId, message);
}

// Notificar nueva transacción
function notifyNewTransaction(transactionId, userId, transaction) {
  const message = {
    type: 'new_transaction',
    transactionId,
    transaction,
    timestamp: new Date().toISOString()
  };
  
  return sendToUser(userId, message);
}

// Notificar confirmación de pago
function notifyPaymentConfirmed(paymentId, userId, transaction) {
  const message = {
    type: 'payment_confirmed',
    paymentId,
    transaction,
    message: '¡Pago confirmado exitosamente!',
    timestamp: new Date().toISOString()
  };
  
  return sendToUser(userId, message);
}

// Notificar error de pago
function notifyPaymentError(paymentId, userId, error) {
  const message = {
    type: 'payment_error',
    paymentId,
    error,
    timestamp: new Date().toISOString()
  };
  
  return sendToUser(userId, message);
}

// Notificar actualización de precios
function notifyPriceUpdate(currency, price, source) {
  const message = {
    type: 'price_update',
    currency,
    price,
    source,
    timestamp: new Date().toISOString()
  };
  
  // Enviar a todos los usuarios conectados
  let sentCount = 0;
  userConnections.forEach((ws, userId) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      sentCount++;
    }
  });
  
  return sentCount;
}

// Obtener estadísticas de conexiones
function getConnectionStats() {
  return {
    totalConnections: userConnections.size,
    connectedUsers: Array.from(userConnections.keys())
  };
}

// Cerrar todas las conexiones
function closeAllConnections() {
  userConnections.forEach((ws, userId) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close(1001, 'Servidor cerrando');
    }
  });
  userConnections.clear();
}

module.exports = {
  initializeWebSocket,
  sendToUser,
  sendToUsers,
  notifyPaymentUpdate,
  notifyNewTransaction,
  notifyPaymentConfirmed,
  notifyPaymentError,
  notifyPriceUpdate,
  getConnectionStats,
  closeAllConnections
};
