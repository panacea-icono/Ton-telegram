#!/usr/bin/env node

/**
 * =============================================================================
 * PANACEA ICONO SA - TELEGRAM MODULATOR
 * =============================================================================
 * Modular Telegram bot service management
 * =============================================================================
 */

// Conditional imports to avoid issues in test environments
let TelegramBot, fs, path;

try {
  TelegramBot = require('node-telegram-bot-api');
  fs = require('fs');
  path = require('path');
} catch (error) {
  // Module not available or failed to load
  console.warn('Some telegram modules failed to load:', error.message);
}

class TelegramModulator {
  constructor(config = {}) {
    this.config = {
      mode: config.mode || 'polling',
      botsConfigPath: config.botsConfigPath || './config/bots.config.json',
      webhookUrl: config.webhookUrl || process.env.WEBHOOK_URL,
      ...config
    };

    this.bots = new Map();
    this.botConfigs = [];
    this.isRunning = false;
    this.statistics = {
      totalMessages: 0,
      botInteractions: {},
      startTime: null
    };
  }

  async start() {
    console.log('🚀 Starting Telegram Modulator...');
    
    try {
      // Load bot configurations
      await this.loadBotConfigurations();
      
      // Initialize bots
      await this.initializeBots();
      
      // Start bots
      await this.startBots();
      
      this.isRunning = true;
      this.statistics.startTime = new Date();
      
      console.log('✅ Telegram Modulator started successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to start Telegram Modulator:', error.message);
      throw error;
    }
  }

  async stop() {
    console.log('🛑 Stopping Telegram Modulator...');
    
    try {
      // Stop all bots
      for (const [botName, bot] of this.bots) {
        try {
          await bot.stopPolling();
          console.log(`✅ Bot ${botName} stopped`);
        } catch (error) {
          console.error(`❌ Failed to stop bot ${botName}:`, error.message);
        }
      }

      this.bots.clear();
      this.isRunning = false;
      
      console.log('✅ Telegram Modulator stopped successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to stop Telegram Modulator:', error.message);
      throw error;
    }
  }

  async loadBotConfigurations() {
    try {
      if (!fs.existsSync(this.config.botsConfigPath)) {
        console.warn(`⚠️  Bot config file not found: ${this.config.botsConfigPath}`);
        this.botConfigs = [];
        return;
      }

      const configData = fs.readFileSync(this.config.botsConfigPath, 'utf8');
      const config = JSON.parse(configData);
      this.botConfigs = config.bots || [];
      
      console.log(`✅ Loaded ${this.botConfigs.length} bot configurations`);
    } catch (error) {
      console.error('❌ Failed to load bot configurations:', error.message);
      throw error;
    }
  }

  async initializeBots() {
    console.log('🤖 Initializing Telegram bots...');
    
    for (const botConfig of this.botConfigs) {
      try {
        await this.initializeBot(botConfig);
      } catch (error) {
        console.error(`❌ Failed to initialize bot ${botConfig.name}:`, error.message);
      }
    }
  }

  async initializeBot(botConfig) {
    const token = process.env[botConfig.token];
    if (!token) {
      throw new Error(`Token not found for bot ${botConfig.name}: ${botConfig.token}`);
    }

    const botOptions = {
      polling: botConfig.mode === 'polling',
      webHook: botConfig.mode === 'webhook'
    };

    const bot = new TelegramBot(token, botOptions);
    
    // Set up basic command handlers
    this.setupBotHandlers(bot, botConfig);
    
    this.bots.set(botConfig.name, bot);
    this.statistics.botInteractions[botConfig.name] = {
      messages: 0,
      commands: 0,
      errors: 0
    };
    
    console.log(`✅ Bot ${botConfig.name} initialized`);
  }

  setupBotHandlers(bot, botConfig) {
    // Basic start command
    bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const welcomeMessage = `
🏥 Welcome to ${botConfig.persona?.name || 'Panacea Bot'}!

${botConfig.persona?.description || 'I am here to assist you with the Panacea ecosystem.'}

Available commands:
/help - Show help information
/status - Check bot status
/wallet - Wallet operations
/balance - Check wallet balance
/ai - AI assistance
      `;
      
      bot.sendMessage(chatId, welcomeMessage);
      this.updateStatistics(botConfig.name, 'commands');
    });

    // Help command
    bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      const helpMessage = `
🆘 Help - ${botConfig.persona?.name || 'Panacea Bot'}

Available Commands:
• /start - Start the bot
• /help - Show this help
• /status - Bot status
• /wallet - Wallet operations
• /balance <chain> <address> - Check balance
• /ai <question> - Ask AI assistant

For medical assistance, ask any health-related question!
      `;
      
      bot.sendMessage(chatId, helpMessage);
      this.updateStatistics(botConfig.name, 'commands');
    });

    // Status command
    bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;
      const stats = this.statistics.botInteractions[botConfig.name];
      const statusMessage = `
📊 Bot Status: ${botConfig.name}

• Status: ✅ Running
• Messages processed: ${stats.messages}
• Commands executed: ${stats.commands}
• Uptime: ${this.getUptime()}
• Mode: ${botConfig.mode}
      `;
      
      bot.sendMessage(chatId, statusMessage);
      this.updateStatistics(botConfig.name, 'commands');
    });

    // AI command (if AI module is enabled)
    if (botConfig.modules?.includes('ai_openai')) {
      bot.onText(/\/ai (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const question = match[1];
        
        try {
          // This would integrate with the AI modulator
          const response = `🤖 AI Response to: "${question}"\n\nThis is a placeholder response. The AI modulator integration would provide the actual AI response here.`;
          
          bot.sendMessage(chatId, response);
          this.updateStatistics(botConfig.name, 'commands');
        } catch (error) {
          bot.sendMessage(chatId, `❌ AI Error: ${error.message}`);
          this.updateStatistics(botConfig.name, 'errors');
        }
      });
    }

    // Wallet commands (if wallet module is enabled)
    if (botConfig.modules?.includes('multi_wallet')) {
      bot.onText(/\/balance (\w+) (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const [, chain, address] = match;
        
        try {
          // This would integrate with the wallet modulator
          const response = `💰 Balance for ${chain} address: ${address}\n\nThis is a placeholder. The wallet modulator integration would provide actual balance data here.`;
          
          bot.sendMessage(chatId, response);
          this.updateStatistics(botConfig.name, 'commands');
        } catch (error) {
          bot.sendMessage(chatId, `❌ Wallet Error: ${error.message}`);
          this.updateStatistics(botConfig.name, 'errors');
        }
      });
    }

    // Generic message handler
    bot.on('message', (msg) => {
      if (!msg.text?.startsWith('/')) {
        this.updateStatistics(botConfig.name, 'messages');
        
        // Handle non-command messages based on bot persona
        if (botConfig.persona?.name === 'Dr. Tapia') {
          this.handleMedicalQuery(bot, msg, botConfig);
        }
      }
    });

    // Error handler
    bot.on('error', (error) => {
      console.error(`Bot ${botConfig.name} error:`, error.message);
      this.updateStatistics(botConfig.name, 'errors');
    });
  }

  async handleMedicalQuery(bot, msg, botConfig) {
    const chatId = msg.chat.id;
    const query = msg.text;
    
    // Check if it seems like a medical question
    const medicalKeywords = ['pain', 'hurt', 'sick', 'symptom', 'health', 'medicine', 'doctor', 'hospital', 'treatment'];
    const isMedicalQuery = medicalKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
    
    if (isMedicalQuery) {
      const response = `
🏥 Dr. Tapia here! I understand you have a medical concern.

Regarding: "${query}"

This is a placeholder for medical AI response. In the full implementation, this would:
- Use the AI modulator to generate a medical response
- Provide professional medical guidance
- Always remind to consult with healthcare professionals

⚠️ Important: Always consult with qualified healthcare professionals for medical advice.
      `;
      
      bot.sendMessage(chatId, response);
    }
  }

  updateStatistics(botName, type) {
    if (this.statistics.botInteractions[botName]) {
      this.statistics.botInteractions[botName][type]++;
    }
    this.statistics.totalMessages++;
  }

  getUptime() {
    if (!this.statistics.startTime) return '0 seconds';
    
    const uptime = Date.now() - this.statistics.startTime.getTime();
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }

  async startBots() {
    for (const [botName, bot] of this.bots) {
      try {
        if (this.config.mode === 'webhook') {
          // Set webhook if in webhook mode
          const webhookUrl = `${this.config.webhookUrl}/bot${botName}`;
          await bot.setWebHook(webhookUrl);
          console.log(`✅ Bot ${botName} webhook set: ${webhookUrl}`);
        } else {
          // Start polling
          await bot.startPolling();
          console.log(`✅ Bot ${botName} polling started`);
        }
      } catch (error) {
        console.error(`❌ Failed to start bot ${botName}:`, error.message);
      }
    }
  }

  async checkHealth() {
    if (!this.isRunning) return false;
    
    try {
      let healthyBots = 0;
      
      for (const [botName, bot] of this.bots) {
        try {
          // Try to get bot info to check if it's healthy
          await bot.getMe();
          healthyBots++;
        } catch (error) {
          console.error(`Bot ${botName} health check failed:`, error.message);
        }
      }
      
      // Consider healthy if at least one bot is working
      return healthyBots > 0;
    } catch (error) {
      console.error('Telegram health check failed:', error.message);
      return false;
    }
  }

  async getBotStatus(botName) {
    if (!this.bots.has(botName)) {
      throw new Error(`Bot not found: ${botName}`);
    }

    const bot = this.bots.get(botName);
    const stats = this.statistics.botInteractions[botName];
    
    try {
      const botInfo = await bot.getMe();
      return {
        name: botName,
        username: botInfo.username,
        isRunning: true,
        statistics: stats,
        uptime: this.getUptime()
      };
    } catch (error) {
      return {
        name: botName,
        isRunning: false,
        error: error.message,
        statistics: stats
      };
    }
  }

  async getAllBotsStatus() {
    const statuses = [];
    
    for (const botName of this.bots.keys()) {
      try {
        const status = await this.getBotStatus(botName);
        statuses.push(status);
      } catch (error) {
        statuses.push({
          name: botName,
          isRunning: false,
          error: error.message
        });
      }
    }
    
    return {
      totalBots: this.bots.size,
      statistics: this.statistics,
      bots: statuses
    };
  }

  // CLI methods
  async executeCommand(command, ...args) {
    switch (command) {
      case 'start':
        await this.start();
        break;
      case 'stop':
        await this.stop();
        break;
      case 'health':
        const health = await this.checkHealth();
        console.log(`Telegram Health: ${health ? '✅ Healthy' : '❌ Unhealthy'}`);
        break;
      case 'status':
        const status = await this.getAllBotsStatus();
        console.log(JSON.stringify(status, null, 2));
        break;
      case 'bot-status':
        if (args.length >= 1) {
          const botStatus = await this.getBotStatus(args[0]);
          console.log(JSON.stringify(botStatus, null, 2));
        } else {
          console.log('Usage: bot-status <botName>');
        }
        break;
      case 'stats':
        console.table(this.statistics.botInteractions);
        break;
      default:
        console.log('Available commands: start, stop, health, status, bot-status <name>, stats');
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2] || 'status';
  const args = process.argv.slice(3);

  try {
    const modulator = new TelegramModulator();
    await modulator.executeCommand(command, ...args);
  } catch (error) {
    console.error('❌ Telegram Modulator error:', error.message);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = TelegramModulator;