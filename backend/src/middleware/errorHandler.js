const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de validación de Prisma
  if (err.code === 'P2002') {
    return res.status(400).json({
      error: 'Conflicto de datos',
      message: 'Ya existe un registro con estos datos únicos',
      code: 'DUPLICATE_ENTRY'
    });
  }

  // Error de registro no encontrado
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'No encontrado',
      message: 'El registro solicitado no existe',
      code: 'NOT_FOUND'
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      message: 'El token de autenticación no es válido',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado',
      message: 'El token de autenticación ha expirado',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      message: err.message,
      code: 'VALIDATION_ERROR'
    });
  }

  // Error de rate limiting
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Demasiadas solicitudes',
      message: 'Has excedido el límite de solicitudes. Intenta de nuevo más tarde.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }

  // Error del servidor
  res.status(err.status || 500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal',
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };
