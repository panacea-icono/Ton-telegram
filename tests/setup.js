/**
 * Jest setup file for panas-token-ecosystem
 * Configures test environment and global mocks
 */

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to silence console.log in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock environment variables
process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.NODE_ENV = 'test';

// Global test utilities
global.testUtils = {
  // Create mock bot token
  createMockBotToken: (botName = 'test-bot') => `test-${botName}-token-${Date.now()}`,
  
  // Create mock environment
  createMockEnv: (overrides = {}) => ({
    NODE_ENV: 'test',
    TELEGRAM_BOT_TOKEN: 'test-bot-token',
    OPENAI_API_KEY: 'test-openai-key',
    ...overrides
  }),
  
  // Wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Create mock Telegram message
  createMockMessage: (overrides = {}) => ({
    message_id: 1,
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
    text: '/test',
    ...overrides
  }),
  
  // Create mock Telegram callback query
  createMockCallbackQuery: (overrides = {}) => ({
    id: 'test-callback-id',
    from: {
      id: 123456789,
      is_bot: false,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser'
    },
    message: {
      message_id: 1,
      from: {
        id: 123456789,
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
    data: 'test-callback-data',
    ...overrides
  })
};

// Mock file system operations
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn(() => [])
}));

// Mock child_process
jest.mock('child_process', () => ({
  execSync: jest.fn(),
  spawn: jest.fn(),
  exec: jest.fn()
}));

// Mock axios for HTTP requests
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }))
}));

// Mock node-telegram-bot-api
jest.mock('node-telegram-bot-api', () => {
  return jest.fn().mockImplementation(() => ({
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
  }));
});

// Mock OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }));
});

// Global test timeout
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('🧪 Test environment configured');
