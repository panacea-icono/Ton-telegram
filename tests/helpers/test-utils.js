/**
 * Test utilities and helpers
 */

const fs = require('fs');
const path = require('path');

class TestUtils {
  /**
   * Load test fixtures
   */
  static loadFixture(fixtureName) {
    const fixturePath = path.join(__dirname, '../fixtures', `${fixtureName}.json`);
    try {
      const content = fs.readFileSync(fixturePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load fixture ${fixtureName}: ${error.message}`);
    }
  }

  /**
   * Create mock Telegram message
   */
  static createMockMessage(overrides = {}) {
    const baseMessage = {
      message_id: Math.floor(Math.random() * 1000),
      from: {
        id: 123456789,
        is_bot: false,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        language_code: 'en'
      },
      chat: {
        id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        type: 'private'
      },
      date: Math.floor(Date.now() / 1000),
      text: '/test'
    };

    return { ...baseMessage, ...overrides };
  }

  /**
   * Create mock Telegram callback query
   */
  static createMockCallbackQuery(overrides = {}) {
    const baseCallbackQuery = {
      id: `test-callback-${Date.now()}`,
      from: {
        id: 123456789,
        is_bot: false,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser'
      },
      message: {
        message_id: Math.floor(Math.random() * 1000),
        from: {
          id: 987654321,
          is_bot: true,
          first_name: 'Test Bot',
          username: 'testbot'
        },
        chat: {
          id: 123456789,
          type: 'private'
        },
        date: Math.floor(Date.now() / 1000),
        text: 'Test message'
      },
      data: 'test-callback-data'
    };

    return { ...baseCallbackQuery, ...overrides };
  }

  /**
   * Create mock bot configuration
   */
  static createMockBotConfig(overrides = {}) {
    const baseConfig = {
      name: 'test-bot',
      token: 'test-token',
      mode: 'polling',
      modules: ['core'],
      persona: {
        name: 'Test Bot',
        description: 'A test bot',
        personality: 'Helpful'
      }
    };

    return { ...baseConfig, ...overrides };
  }

  /**
   * Create mock environment variables
   */
  static createMockEnv(overrides = {}) {
    const baseEnv = {
      NODE_ENV: 'test',
      TELEGRAM_BOT_TOKEN: 'test-bot-token',
      OPENAI_API_KEY: 'test-openai-key'
    };

    return { ...baseEnv, ...overrides };
  }

  /**
   * Wait for specified time
   */
  static wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create mock file system
   */
  static createMockFS(files = {}) {
    return {
      readFileSync: jest.fn((filePath) => {
        const normalizedPath = filePath.replace(/\\/g, '/');
        if (files[normalizedPath]) {
          return typeof files[normalizedPath] === 'string' 
            ? files[normalizedPath] 
            : JSON.stringify(files[normalizedPath]);
        }
        throw new Error(`File not found: ${filePath}`);
      }),
      writeFileSync: jest.fn(),
      existsSync: jest.fn((filePath) => {
        const normalizedPath = filePath.replace(/\\/g, '/');
        return Object.keys(files).includes(normalizedPath);
      }),
      readdirSync: jest.fn((dirPath) => {
        const normalizedPath = dirPath.replace(/\\/g, '/');
        const dirFiles = Object.keys(files)
          .filter(key => key.startsWith(normalizedPath))
          .map(key => key.replace(normalizedPath + '/', ''));
        return dirFiles;
      }),
      mkdirSync: jest.fn()
    };
  }

  /**
   * Create mock execSync
   */
  static createMockExecSync(responses = {}) {
    return jest.fn((command) => {
      // Check for specific command responses
      for (const [pattern, response] of Object.entries(responses)) {
        if (command.includes(pattern)) {
          return response;
        }
      }
      
      // Default responses for common commands
      if (command.includes('git status')) return '';
      if (command.includes('git branch')) return 'main';
      if (command.includes('npm test')) return 'Tests passed';
      if (command.includes('npm run build')) return 'Build completed';
      if (command.includes('npm run lint')) return 'Linting completed';
      
      return 'success';
    });
  }

  /**
   * Assert bot response
   */
  static assertBotResponse(response, expectedText, expectedOptions = {}) {
    expect(response).toBeDefined();
    expect(response.text).toContain(expectedText);
    
    if (expectedOptions.parseMode) {
      expect(response.parse_mode).toBe(expectedOptions.parseMode);
    }
    
    if (expectedOptions.replyMarkup) {
      expect(response.reply_markup).toEqual(expectedOptions.replyMarkup);
    }
  }

  /**
   * Assert error handling
   */
  static assertErrorHandling(fn, expectedError) {
    expect(fn).toThrow(expectedError);
  }

  /**
   * Create test data for specific scenarios
   */
  static createTestData(scenario) {
    const scenarios = {
      'bot-startup': {
        config: this.createMockBotConfig(),
        env: this.createMockEnv(),
        expectedModules: ['core']
      },
      'ai-interaction': {
        message: this.createMockMessage({ text: '/ask What is AI?' }),
        expectedResponse: 'AI response',
        aiConfig: {
          provider: 'openai',
          model: 'gpt-3.5-turbo'
        }
      },
      'token-transaction': {
        message: this.createMockMessage({ text: '/balance' }),
        expectedResponse: 'Token balance',
        userBalance: {
          PANAS: 1000,
          USDT: 500
        }
      },
      'error-scenario': {
        message: this.createMockMessage({ text: '/invalid-command' }),
        expectedError: 'Unknown command',
        errorCode: 'INVALID_COMMAND'
      }
    };

    return scenarios[scenario] || {};
  }

  /**
   * Mock console methods for testing
   */
  static mockConsole() {
    const originalConsole = { ...console };
    
    const mockConsole = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn()
    };

    Object.assign(console, mockConsole);
    
    return {
      mockConsole,
      restoreConsole: () => Object.assign(console, originalConsole)
    };
  }

  /**
   * Create mock HTTP responses
   */
  static createMockHttpResponse(status = 200, data = {}, headers = {}) {
    return {
      status,
      data,
      headers: {
        'content-type': 'application/json',
        ...headers
      }
    };
  }

  /**
   * Assert async function throws
   */
  static async assertAsyncThrows(fn, expectedError) {
    await expect(fn).rejects.toThrow(expectedError);
  }

  /**
   * Create mock database connection
   */
  static createMockDatabase() {
    return {
      connect: jest.fn().mockResolvedValue(true),
      disconnect: jest.fn().mockResolvedValue(true),
      query: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockResolvedValue({ id: 1 }),
      update: jest.fn().mockResolvedValue({ affectedRows: 1 }),
      delete: jest.fn().mockResolvedValue({ affectedRows: 1 })
    };
  }

  /**
   * Generate test report
   */
  static generateTestReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      total: results.length,
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'failed').length,
      duration: results.reduce((sum, r) => sum + (r.duration || 0), 0),
      results: results
    };

    return report;
  }
}

module.exports = TestUtils;
