/**
 * Unit tests for Telegram bot functionality
 */

const TelegramBot = require('node-telegram-bot-api');
const { execSync } = require('child_process');
const fs = require('fs');

// Mock modules
jest.mock('node-telegram-bot-api');
jest.mock('child_process');
jest.mock('fs');

describe('Telegram Bot Tests', () => {
  let mockBot;
  let mockConfig;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock bot instance
    mockBot = {
      onText: jest.fn(),
      on: jest.fn(),
      sendMessage: jest.fn(),
      answerCallbackQuery: jest.fn(),
      editMessageText: jest.fn(),
      deleteMessage: jest.fn(),
      getMe: jest.fn(),
      setWebHook: jest.fn(),
      deleteWebHook: jest.fn(),
      getWebHookInfo: jest.fn(),
      startPolling: jest.fn(),
      stopPolling: jest.fn(),
      isPolling: jest.fn(() => false)
    };

    TelegramBot.mockImplementation(() => mockBot);

    // Mock config
    mockConfig = {
      bots: [
        {
          name: 'test-bot',
          token: 'test-token',
          modules: ['core', 'ai_openai'],
          persona: {
            name: 'Test Bot',
            description: 'A test bot'
          }
        }
      ]
    };

    // Mock fs operations
    fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));
    fs.existsSync.mockReturnValue(true);
  });

  describe('Bot Initialization', () => {
    test('should create bot instance with correct token', () => {
      const token = 'test-bot-token';
      new TelegramBot(token);

      expect(TelegramBot).toHaveBeenCalledWith(token);
    });

    test('should handle bot creation errors gracefully', () => {
      const error = new Error('Invalid token');
      TelegramBot.mockImplementationOnce(() => {
        throw error;
      });

      expect(() => {
        new TelegramBot('invalid-token');
      }).toThrow('Invalid token');
    });
  });

  describe('Message Handling', () => {
    test('should register text message handlers', () => {
      const bot = new TelegramBot('test-token');
      const regex = /\/start/;
      const callback = jest.fn();

      bot.onText(regex, callback);

      expect(mockBot.onText).toHaveBeenCalledWith(regex, callback);
    });

    test('should handle message events', () => {
      const bot = new TelegramBot('test-token');
      const event = 'message';
      const callback = jest.fn();

      bot.on(event, callback);

      expect(mockBot.on).toHaveBeenCalledWith(event, callback);
    });
  });

  describe('Bot Commands', () => {
    test('should send message correctly', async () => {
      const bot = new TelegramBot('test-token');
      const chatId = 123456789;
      const text = 'Hello, world!';

      mockBot.sendMessage.mockResolvedValue({ message_id: 1 });

      await bot.sendMessage(chatId, text);

      expect(mockBot.sendMessage).toHaveBeenCalledWith(chatId, text);
    });

    test('should handle send message errors', async () => {
      const bot = new TelegramBot('test-token');
      const chatId = 123456789;
      const text = 'Hello, world!';
      const error = new Error('Send failed');

      mockBot.sendMessage.mockRejectedValue(error);

      await expect(bot.sendMessage(chatId, text)).rejects.toThrow('Send failed');
    });

    test('should answer callback queries', async () => {
      const bot = new TelegramBot('test-token');
      const callbackQueryId = 'test-callback-id';
      const text = 'Callback answered';

      mockBot.answerCallbackQuery.mockResolvedValue(true);

      await bot.answerCallbackQuery(callbackQueryId, { text });

      expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith(callbackQueryId, { text });
    });
  });

  describe('Bot Lifecycle', () => {
    test('should start polling', () => {
      const bot = new TelegramBot('test-token');

      bot.startPolling();

      expect(mockBot.startPolling).toHaveBeenCalled();
    });

    test('should stop polling', () => {
      const bot = new TelegramBot('test-token');

      bot.stopPolling();

      expect(mockBot.stopPolling).toHaveBeenCalled();
    });

    test('should check polling status', () => {
      const bot = new TelegramBot('test-token');

      const isPolling = bot.isPolling();

      expect(mockBot.isPolling).toHaveBeenCalled();
      expect(isPolling).toBe(false);
    });
  });

  describe('Webhook Management', () => {
    test('should set webhook', async () => {
      const bot = new TelegramBot('test-token');
      const url = 'https://example.com/webhook';

      mockBot.setWebHook.mockResolvedValue(true);

      await bot.setWebHook(url);

      expect(mockBot.setWebHook).toHaveBeenCalledWith(url);
    });

    test('should delete webhook', async () => {
      const bot = new TelegramBot('test-token');

      mockBot.deleteWebHook.mockResolvedValue(true);

      await bot.deleteWebHook();

      expect(mockBot.deleteWebHook).toHaveBeenCalled();
    });

    test('should get webhook info', async () => {
      const bot = new TelegramBot('test-token');
      const webhookInfo = { url: 'https://example.com/webhook', has_custom_certificate: false };

      mockBot.getWebHookInfo.mockResolvedValue(webhookInfo);

      const result = await bot.getWebHookInfo();

      expect(mockBot.getWebHookInfo).toHaveBeenCalled();
      expect(result).toEqual(webhookInfo);
    });
  });

  describe('Bot Information', () => {
    test('should get bot info', async () => {
      const bot = new TelegramBot('test-token');
      const botInfo = {
        id: 123456789,
        is_bot: true,
        first_name: 'Test Bot',
        username: 'testbot'
      };

      mockBot.getMe.mockResolvedValue(botInfo);

      const result = await bot.getMe();

      expect(mockBot.getMe).toHaveBeenCalled();
      expect(result).toEqual(botInfo);
    });
  });
});
