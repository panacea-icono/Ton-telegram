#!/usr/bin/env node

/**
 * =============================================================================
 * GET MY ID LITE - PANACEA ICONO SA
 * =============================================================================
 * Script ligero para obtener tu ID de Telegram sin dependencias externas
 * =============================================================================
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class TelegramIDGetter {
  constructor() {
    this.botTokens = {
      ALINA_KUCHITV_BOT:
        'your_telegram_auth_token_here',
      DR_TAPIA_BOT:
        'your_telegram_api_key_here',
    };

    this.currentBot = 'ALINA_KUCHITV_BOT';
    this.currentToken = this.botTokens[this.currentBot];
  }

  /**
   * Realiza una petición HTTP a la API de Telegram
   */
  async makeRequest(endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const url = `https://api.telegram.org/bot${this.currentToken}/${endpoint}`;
      const urlObj = new URL(url);

      const options = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname + urlObj.search,
        method: data ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Panas-Token-Ecosystem/1.0.0',
        },
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const jsonData = JSON.parse(responseData);
            resolve(jsonData);
          } catch (error) {
            reject(new Error(`Error parsing response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request error: ${error.message}`));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  /**
   * Obtiene información del bot
   */
  async getBotInfo() {
    try {
      const response = await this.makeRequest('getMe');
      if (response.ok) {
        return response.result;
      } else {
        throw new Error(`Bot API error: ${response.description}`);
      }
    } catch (error) {
      throw new Error(`Error getting bot info: ${error.message}`);
    }
  }

  /**
   * Obtiene los mensajes recientes
   */
  async getRecentMessages() {
    try {
      const response = await this.makeRequest('getUpdates', {
        limit: 10,
        timeout: 30,
      });

      if (response.ok) {
        return response.result;
      } else {
        throw new Error(`Bot API error: ${response.description}`);
      }
    } catch (error) {
      throw new Error(`Error getting messages: ${error.message}`);
    }
  }

  /**
   * Procesa los mensajes para encontrar tu ID
   */
  processMessages(updates) {
    const userMessages = [];

    for (const update of updates) {
      if (update.message && update.message.from) {
        const user = update.message.from;
        const message = update.message;

        userMessages.push({
          id: user.id,
          username: user.username || 'Sin username',
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          text: message.text || '',
          date: new Date(message.date * 1000).toLocaleString('es-ES'),
        });
      }
    }

    // Remover duplicados por ID
    const uniqueUsers = userMessages.reduce((acc, current) => {
      if (!acc.find((user) => user.id === current.id)) {
        acc.push(current);
      }
      return acc;
    }, []);

    return uniqueUsers;
  }

  /**
   * Ejecuta el proceso completo
   */
  async run() {
    try {
      console.log('🤖 Obteniendo tu ID de Telegram...');
      console.log('='.repeat(50));

      // Mostrar qué bot estamos usando
      console.log(`🔍 Usando token desde BOT_${this.currentBot}_TOKEN`);
      console.log(`📱 Bot: @${this.currentBot}`);
      console.log('');

      // Obtener información del bot
      const botInfo = await this.getBotInfo();
      console.log(
        `✅ Bot conectado: @${botInfo.username} (${botInfo.first_name})`
      );
      console.log('');

      console.log('⏳ Esperando mensajes nuevos (30 segundos)...');
      console.log(
        '💡 Envía "/start" al bot @' + botInfo.username + ' desde tu Telegram'
      );
      console.log('');

      // Obtener mensajes recientes
      const updates = await this.getRecentMessages();
      const users = this.processMessages(updates);

      if (users.length === 0) {
        console.log('❌ No se encontraron mensajes recientes.');
        console.log(
          '💡 Asegúrate de enviar "/start" al bot y vuelve a ejecutar el comando.'
        );
        return;
      }

      console.log('👥 Usuarios encontrados:');
      console.log('');

      for (const user of users) {
        console.log(`✅ Tu ID: ${user.id} @${user.username}`);
        console.log(
          `   Nombre: ${user.first_name} ${user.last_name || ''}`.trim()
        );
        console.log(`   Último mensaje: "${user.text}"`);
        console.log(`   Fecha: ${user.date}`);
        console.log('');
      }

      // Mostrar el ID principal (el más reciente)
      if (users.length > 0) {
        const mainUser = users[0];
        console.log('🎯 ID Principal para configuración:');
        console.log(`   ${mainUser.id}`);
        console.log('');
        console.log('📋 Copia este número para configurarte como admin.');
      }
    } catch (error) {
      console.error('❌ Error:', error.message);

      if (error.message.includes('Unauthorized')) {
        console.log('💡 El token del bot no es válido o ha expirado.');
      } else if (error.message.includes('Request error')) {
        console.log('💡 Error de conexión. Verifica tu internet.');
      }
    }
  }
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

if (require.main === module) {
  const getter = new TelegramIDGetter();
  getter.run();
}

module.exports = TelegramIDGetter;
