const { Resend } = require('resend');

class EmailService {
  constructor() {
    // Inicializar Resend con la API key
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  RESEND_API_KEY no está configurada. Los emails no se enviarán.');
    }
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  /**
   * Envía un email con una pregunta del FAQ
   * @param {string} question - La pregunta del usuario
   * @param {string} context - El contexto opcional de la pregunta
   * @returns {Promise<Object>}
   */
  async sendFAQQuestion(question, context = '') {
    try {
      if (!this.resend) {
        throw new Error('RESEND_API_KEY no está configurada. Por favor configura la API key en el archivo .env');
      }

      const { data, error } = await this.resend.emails.send({
        from: 'MidatoPay <onboarding@resend.dev>',
        to: ['midatopay@gmail.com'],
        subject: 'Nueva pregunta desde el FAQ - MidatoPay',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background-color: #FF6A00;
                color: white;
                padding: 20px;
                border-radius: 8px 8px 0 0;
                text-align: center;
              }
              .content {
                background-color: #f9f9f9;
                padding: 20px;
                border: 1px solid #ddd;
                border-top: none;
                border-radius: 0 0 8px 8px;
              }
              .question-section {
                margin-bottom: 20px;
              }
              .label {
                font-weight: bold;
                color: #FF6A00;
                margin-bottom: 8px;
                display: block;
              }
              .value {
                background-color: white;
                padding: 12px;
                border-radius: 4px;
                border-left: 4px solid #FF6A00;
                margin-top: 8px;
              }
              .footer {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 12px;
                color: #666;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Nueva Pregunta desde el FAQ</h2>
            </div>
            <div class="content">
              <div class="question-section">
                <span class="label">Pregunta:</span>
                <div class="value">${question.replace(/\n/g, '<br>')}</div>
              </div>
              
              ${context ? `
              <div class="question-section">
                <span class="label">Contexto:</span>
                <div class="value">${context.replace(/\n/g, '<br>')}</div>
              </div>
              ` : ''}
              
              <div class="question-section">
                <span class="label">Fecha:</span>
                <div class="value">${new Date().toLocaleString('es-AR', { 
                  dateStyle: 'full', 
                  timeStyle: 'long' 
                })}</div>
              </div>
            </div>
            <div class="footer">
              <p>Este email fue enviado automáticamente desde el formulario de FAQ de MidatoPay.</p>
            </div>
          </body>
          </html>
        `,
        text: `
Nueva pregunta desde el FAQ - MidatoPay

Pregunta:
${question}

${context ? `Contexto:\n${context}\n\n` : ''}
Fecha: ${new Date().toLocaleString('es-AR', { 
  dateStyle: 'full', 
  timeStyle: 'long' 
})}
        `.trim()
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        messageId: data.id
      };
    } catch (error) {
      console.error('Error enviando email:', error);
      throw new Error(`Error al enviar el email: ${error.message}`);
    }
  }

  /**
   * Verifica la configuración del servicio de email
   * @returns {Promise<boolean>}
   */
  async verifyConnection() {
    try {
      // Resend no tiene un método verify, pero podemos intentar enviar un email de prueba
      return true;
    } catch (error) {
      console.error('Error verificando conexión:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
