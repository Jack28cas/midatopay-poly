const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const { body, validationResult } = require('express-validator');

/**
 * POST /api/faq/question
 * Envía una pregunta del FAQ por email
 */
router.post(
  '/question',
  [
    body('question')
      .trim()
      .notEmpty()
      .withMessage('La pregunta es requerida')
      .isLength({ min: 5, max: 500 })
      .withMessage('La pregunta debe tener entre 5 y 500 caracteres'),
    body('context')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('El contexto no puede exceder 1000 caracteres')
  ],
  async (req, res) => {
    try {
      // Validar errores
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { question, context } = req.body;

      // Enviar email
      const result = await emailService.sendFAQQuestion(question, context || '');

      res.status(200).json({
        success: true,
        message: 'Pregunta enviada correctamente',
        messageId: result.messageId
      });
    } catch (error) {
      console.error('Error en /api/faq/question:', error);
      res.status(500).json({
        success: false,
        error: 'Error al enviar la pregunta. Por favor intenta de nuevo más tarde.'
      });
    }
  }
);

module.exports = router;

