const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TOKEN) {
  console.warn('⚠️  TELEGRAM_BOT_TOKEN no configurado. Bot en modo inactivo.');
  // Mantener proceso vivo para integrarse con start-all
  setInterval(() => {}, 1 << 30);
} else {
  // Carga perezosa para evitar error si lib no instalada aún
  const TelegramBot = require('node-telegram-bot-api');
  const bot = new TelegramBot(TOKEN, { polling: true });

  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Panas Token Bot activo ✅');
  });

  // Soporte de pagos (requerido por términos para bienes/servicios digitales)
  bot.onText(/\/paysupport/, (msg) => {
    const text = [
      'Soporte de Pagos 🧾',
      '— Indica fecha y detalle del pago (Stars).',
      '— Incluye ID de transacción si lo tienes.',
      '— Te responderemos con el estado y resolución.',
    ].join('\n');
    bot.sendMessage(msg.chat.id, text);
  });

  // Borrado de datos (si aplicamos PII en el futuro)
  bot.onText(/\/delete_data/, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      'Solicitud de borrado registrada. Procederemos a eliminar tus datos conforme nuestras políticas. '
      + 'Si no almacenamos PII, esta acción no es necesaria.'
    );
  });

  console.log('Telegram Bot iniciado con polling.');
}
