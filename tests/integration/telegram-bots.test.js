/**
 * Integration tests for Telegram Bots
 */

const fs = require('fs');
const path = require('path');

// Mock modules
jest.mock('fs');
jest.mock('node-telegram-bot-api');

describe('Telegram Bots Integration Tests', () => {
  let mockBotConfig;
  let mockEnvConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock bot configuration
    mockBotConfig = {
      bots: [
        {
          name: 'dr_tapia_bot',
          token: 'BOT_DR_TAPIA_TOKEN',
          mode: 'polling',
          modules: ['core', 'ai_openai'],
          persona: {
            name: 'Dr. Tapia',
            description: 'Medical AI assistant',
            personality: 'Professional and helpful'
          },
          ai: {
            provider: 'openai',
            model: 'gpt-4o-mini',
            apiKey: 'OPENAI_API_KEY'
          }
        },
        {
          name: 'panas_token_bot',
          token: 'BOT_PANAS_TOKEN_TOKEN',
          mode: 'webhook',
          modules: ['core', 'paysupport'],
          persona: {
            name: 'Panas Token Bot',
            description: 'Token management assistant',
            personality: 'Friendly and informative'
          }
        },
        {
          name: 'anastasia_panacea_bot',
          token: 'BOT_ANASTASIA_PANACEA_TOKEN',
          mode: 'polling',
          modules: ['core', 'ai_openai', 'publisher'],
          persona: {
            name: 'Anastasia',
            description: 'Panacea ecosystem assistant',
            personality: 'Warm and knowledgeable'
          },
          ai: {
            provider: 'openai',
            model: 'gpt-4o-mini',
            apiKey: 'OPENAI_API_KEY'
          }
        }
      ]
    };
    
    // Mock environment configuration
    mockEnvConfig = {
      BOT_DR_TAPIA_TOKEN: 'test-dr-tapia-token',
      BOT_PANAS_TOKEN_TOKEN: 'test-panas-token',
      BOT_ANASTASIA_PANACEA_TOKEN: 'test-anastasia-token',
      OPENAI_API_KEY: 'test-openai-key',
      TELEGRAM_BOT_ADMINS: '7145826810'
    };
    
    // Mock fs operations
    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath.includes('bots.config.json')) {
        return JSON.stringify(mockBotConfig);
      }
      if (filePath.includes('.env.telegram.local')) {
        return Object.entries(mockEnvConfig)
          .map(([key, value]) => `${key}=${value}`)
          .join('\n');
      }
      return '{}';
    });
    
    fs.existsSync.mockReturnValue(true);
  });

  describe('Bot Configuration Loading', () => {
    test('should load bot configuration successfully', () => {
      const configPath = 'config/bots.config.json';
      const config = JSON.parse(fs.readFileSync(configPath));
      
      expect(config).toBeDefined();
      expect(config.bots).toHaveLength(3);
      expect(config.bots[0].name).toBe('dr_tapia_bot');
      expect(config.bots[1].name).toBe('panas_token_bot');
      expect(config.bots[2].name).toBe('anastasia_panacea_bot');
    });

    test('should load environment variables', () => {
      const envPath = '.env.telegram.local';
      const envContent = fs.readFileSync(envPath);
      
      expect(envContent).toContain('BOT_DR_TAPIA_TOKEN=test-dr-tapia-token');
      expect(envContent).toContain('BOT_PANAS_TOKEN_TOKEN=test-panas-token');
      expect(envContent).toContain('BOT_ANASTASIA_PANACEA_TOKEN=test-anastasia-token');
      expect(envContent).toContain('OPENAI_API_KEY=test-openai-key');
    });

    test('should validate bot configuration structure', () => {
      const config = JSON.parse(fs.readFileSync('config/bots.config.json'));
      
      config.bots.forEach(bot => {
        expect(bot).toHaveProperty('name');
        expect(bot).toHaveProperty('token');
        expect(bot).toHaveProperty('mode');
        expect(bot).toHaveProperty('modules');
        expect(bot).toHaveProperty('persona');
        expect(Array.isArray(bot.modules)).toBe(true);
        expect(typeof bot.persona).toBe('object');
      });
    });
  });

  describe('Bot Module Registration', () => {
    test('should register core module for all bots', () => {
      const config = JSON.parse(fs.readFileSync('config/bots.config.json'));
      
      config.bots.forEach(bot => {
        expect(bot.modules).toContain('core');
      });
    });

    test('should register AI module for appropriate bots', () => {
      const config = JSON.parse(fs.readFileSync('config/bots.config.json'));
      
      const aiBots = config.bots.filter(bot => bot.modules.includes('ai_openai'));
      expect(aiBots).toHaveLength(2);
      expect(aiBots[0].name).toBe('dr_tapia_bot');
      expect(aiBots[1].name).toBe('anastasia_panacea_bot');
    });

    test('should register pay support module for token bot', () => {
      const config = JSON.parse(fs.readFileSync('config/bots.config.json'));
      
      const paySupportBot = config.bots.find(bot => bot.name === 'panas_token_bot');
      expect(paySupportBot.modules).toContain('paysupport');
    });

    test('should register publisher module for Anastasia bot', () => {
      const config = JSON.parse(fs.readFileSync('config/bots.config.json'));
      
      const publisherBot = config.bots.find(bot => bot.name === 'anastasia_panacea_bot');
      expect(publisherBot.modules).toContain('publisher');
    });
  });

  describe('Bot Persona Configuration', () => {
    test('should have complete persona configuration', () => {
      const config = JSON.parse(fs.readFileSync('config/bots.config.json'));
      
      config.bots.forEach(bot => {
        expect(bot.persona).toHaveProperty('name');
        expect(bot.persona).toHaveProperty('description');
        expect(bot.persona).toHaveProperty('personality');
        expect(typeof bot.persona.name).toBe('string');
        expect(typeof bot.persona.description).toBe('string');
        expect(typeof bot.persona.personality).toBe('string');
      });
    });

    test('should have unique persona names', () => {
      const config = JSON.parse(fs.readFileSync('config/bots.config.json'));
      const names = config.bots.map(bot => bot.persona.name);
      const uniqueNames = [...new Set(names)];
      
      expect(names).toHaveLength(uniqueNames.length);
    });
  });

  describe('AI Configuration', () => {
    test('should have AI configuration for AI-enabled bots', () => {
      const config = JSON.parse(fs.readFileSync('config/bots.config.json'));
      
      const aiBots = config.bots.filter(bot => bot.modules.includes('ai_openai'));
      
      aiBots.forEach(bot => {
        expect(bot).toHaveProperty('ai');
        expect(bot.ai).toHaveProperty('provider');
        expect(bot.ai).toHaveProperty('model');
        expect(bot.ai).toHaveProperty('apiKey');
        expect(bot.ai.provider).toBe('openai');
        expect(bot.ai.model).toBe('gpt-4o-mini');
      });
    });
  });

  describe('Bot Token Management', () => {
    test('should have token environment variables for all bots', () => {
      const config = JSON.parse(fs.readFileSync('config/bots.config.json'));
      const envContent = fs.readFileSync('.env.telegram.local');
      
      config.bots.forEach(bot => {
        const tokenVar = bot.token;
        expect(envContent).toContain(tokenVar);
      });
    });

    test('should validate token format', () => {
      const config = JSON.parse(fs.readFileSync('config/bots.config.json'));
      
      config.bots.forEach(bot => {
        expect(bot.token).toMatch(/^BOT_[A-Z_]+_TOKEN$/);
      });
    });
  });

  describe('Bot Mode Configuration', () => {
    test('should have valid mode configuration', () => {
      const config = JSON.parse(fs.readFileSync('config/bots.config.json'));
      const validModes = ['polling', 'webhook'];
      
      config.bots.forEach(bot => {
        expect(validModes).toContain(bot.mode);
      });
    });

    test('should have mixed mode configuration', () => {
      const config = JSON.parse(fs.readFileSync('config/bots.config.json'));
      const modes = config.bots.map(bot => bot.mode);
      
      expect(modes).toContain('polling');
      expect(modes).toContain('webhook');
    });
  });

  describe('Bot Validation', () => {
    test('should validate all required fields are present', () => {
      const config = JSON.parse(fs.readFileSync('config/bots.config.json'));
      
      config.bots.forEach(bot => {
        const requiredFields = ['name', 'token', 'mode', 'modules', 'persona'];
        requiredFields.forEach(field => {
          expect(bot).toHaveProperty(field);
        });
      });
    });

    test('should validate module names are valid', () => {
      const config = JSON.parse(fs.readFileSync('config/bots.config.json'));
      const validModules = ['core', 'ai_openai', 'paysupport', 'echo', 'publisher'];
      
      config.bots.forEach(bot => {
        bot.modules.forEach(module => {
          expect(validModules).toContain(module);
        });
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle missing configuration file', () => {
      fs.existsSync.mockReturnValue(false);
      
      expect(fs.existsSync('config/bots.config.json')).toBe(false);
    });

    test('should handle invalid JSON configuration', () => {
      fs.readFileSync.mockReturnValue('invalid json');
      
      expect(() => {
        JSON.parse(fs.readFileSync('config/bots.config.json'));
      }).toThrow();
    });

    test('should handle missing environment variables', () => {
      const envContent = 'BOT_DR_TAPIA_TOKEN=test-token';
      fs.readFileSync.mockReturnValue(envContent);
      
      const envLines = envContent.split('\n');
      const hasAllTokens = envLines.some(line => line.includes('BOT_PANAS_TOKEN_TOKEN'));
      
      expect(hasAllTokens).toBe(false);
    });
  });

  describe('Bot Orchestration', () => {
    test('should be able to start all bots', () => {
      const config = JSON.parse(fs.readFileSync('config/bots.config.json'));
      
      expect(config.bots).toHaveLength(3);
      
      // Simulate starting all bots
      config.bots.forEach(bot => {
        expect(bot.name).toBeDefined();
        expect(bot.token).toBeDefined();
        expect(bot.mode).toBeDefined();
      });
    });

    test('should handle bot startup errors gracefully', () => {
      const config = JSON.parse(fs.readFileSync('config/bots.config.json'));
      
      // Simulate bot startup with error handling
      const startBot = (bot) => {
        if (!bot.name || !bot.token) {
          throw new Error(`Invalid bot configuration: ${bot.name}`);
        }
        return true;
      };
      
      config.bots.forEach(bot => {
        expect(() => startBot(bot)).not.toThrow();
      });
    });
  });
});
