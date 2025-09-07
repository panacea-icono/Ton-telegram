import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const botService = {
  // Get all bots
  async getBots() {
    try {
      const response = await api.get('/bots');
      return response.data;
    } catch (error) {
      // Fallback to mock data if API is not available
      console.warn('API not available, using mock data:', error.message);
      return this.getMockBots();
    }
  },

  // Get bot by ID
  async getBot(id) {
    try {
      const response = await api.get(`/bots/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API not available, using mock data:', error.message);
      return this.getMockBot(id);
    }
  },

  // Create new bot
  async createBot(botData) {
    try {
      const response = await api.post('/bots', botData);
      return response.data;
    } catch (error) {
      console.warn('API not available, simulating bot creation:', error.message);
      return this.createMockBot(botData);
    }
  },

  // Update bot
  async updateBot(id, updates) {
    try {
      const response = await api.put(`/bots/${id}`, updates);
      return response.data;
    } catch (error) {
      console.warn('API not available, simulating bot update:', error.message);
      return this.updateMockBot(id, updates);
    }
  },

  // Delete bot
  async deleteBot(id) {
    try {
      await api.delete(`/bots/${id}`);
      return true;
    } catch (error) {
      console.warn('API not available, simulating bot deletion:', error.message);
      return this.deleteMockBot(id);
    }
  },

  // Start bot
  async startBot(id) {
    try {
      const response = await api.post(`/bots/${id}/start`);
      return response.data;
    } catch (error) {
      console.warn('API not available, simulating bot start:', error.message);
      return { success: true, message: 'Bot started successfully' };
    }
  },

  // Stop bot
  async stopBot(id) {
    try {
      const response = await api.post(`/bots/${id}/stop`);
      return response.data;
    } catch (error) {
      console.warn('API not available, simulating bot stop:', error.message);
      return { success: true, message: 'Bot stopped successfully' };
    }
  },

  // Get bot analytics
  async getBotAnalytics(id, period = '7d') {
    try {
      const response = await api.get(`/bots/${id}/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      console.warn('API not available, using mock analytics:', error.message);
      return this.getMockAnalytics(id, period);
    }
  },

  // Get bot logs
  async getBotLogs(id, limit = 100) {
    try {
      const response = await api.get(`/bots/${id}/logs?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.warn('API not available, using mock logs:', error.message);
      return this.getMockLogs(id, limit);
    }
  },

  // Send message to bot
  async sendMessage(botId, message) {
    try {
      const response = await api.post(`/bots/${botId}/send`, { message });
      return response.data;
    } catch (error) {
      console.warn('API not available, simulating message send:', error.message);
      return { success: true, message: 'Message sent successfully' };
    }
  },

  // Mock data methods (fallback when API is not available)
  getMockBots() {
    return [
      {
        id: 1,
        name: 'PanasToken Bot',
        username: '@panastoken_bot',
        status: 'online',
        messages: 1247,
        users: 89,
        lastActivity: '2 minutes ago',
        avatar: '🤖',
        description: 'Main bot for PanasToken ecosystem',
        modules: ['core', 'ai', 'payments'],
        uptime: '99.9%',
        token: '***hidden***',
        webhook: 'https://api.telegram.org/bot***/setWebhook',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:22:00Z'
      },
      {
        id: 2,
        name: 'PanasPay Bot',
        username: '@panaspay_bot',
        status: 'online',
        messages: 892,
        users: 67,
        lastActivity: '5 minutes ago',
        avatar: '💳',
        description: 'Payment processing bot',
        modules: ['payments', 'wallet'],
        uptime: '99.8%',
        token: '***hidden***',
        webhook: 'https://api.telegram.org/bot***/setWebhook',
        createdAt: '2024-01-16T09:15:00Z',
        updatedAt: '2024-01-20T13:45:00Z'
      },
      {
        id: 3,
        name: 'PanasShop Bot',
        username: '@panasshop_bot',
        status: 'warning',
        messages: 456,
        users: 34,
        lastActivity: '1 hour ago',
        avatar: '🛒',
        description: 'E-commerce bot for medical services',
        modules: ['shop', 'inventory'],
        uptime: '98.5%',
        token: '***hidden***',
        webhook: 'https://api.telegram.org/bot***/setWebhook',
        createdAt: '2024-01-17T11:20:00Z',
        updatedAt: '2024-01-20T12:30:00Z'
      },
      {
        id: 4,
        name: 'Support Bot',
        username: '@panassupport_bot',
        status: 'offline',
        messages: 234,
        users: 23,
        lastActivity: '3 hours ago',
        avatar: '🆘',
        description: 'Customer support bot',
        modules: ['support', 'tickets'],
        uptime: '95.2%',
        token: '***hidden***',
        webhook: 'https://api.telegram.org/bot***/setWebhook',
        createdAt: '2024-01-18T14:10:00Z',
        updatedAt: '2024-01-20T10:15:00Z'
      },
      {
        id: 5,
        name: 'Analytics Bot',
        username: '@panasanalytics_bot',
        status: 'online',
        messages: 567,
        users: 45,
        lastActivity: '10 minutes ago',
        avatar: '📊',
        description: 'Analytics and reporting bot',
        modules: ['analytics', 'reports'],
        uptime: '99.7%',
        token: '***hidden***',
        webhook: 'https://api.telegram.org/bot***/setWebhook',
        createdAt: '2024-01-19T16:45:00Z',
        updatedAt: '2024-01-20T15:20:00Z'
      }
    ];
  },

  getMockBot(id) {
    const bots = this.getMockBots();
    return bots.find(bot => bot.id === parseInt(id));
  },

  createMockBot(botData) {
    const newBot = {
      id: Date.now(),
      ...botData,
      status: 'offline',
      messages: 0,
      users: 0,
      lastActivity: 'Just created',
      uptime: '0%',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return newBot;
  },

  updateMockBot(id, updates) {
    const bot = this.getMockBot(id);
    if (bot) {
      return { ...bot, ...updates, updatedAt: new Date().toISOString() };
    }
    throw new Error('Bot not found');
  },

  deleteMockBot(id) {
    return true;
  },

  getMockAnalytics(id, period) {
    return {
      botId: id,
      period: period,
      messages: {
        total: 1250,
        today: 45,
        thisWeek: 320,
        thisMonth: 1250
      },
      users: {
        total: 89,
        new: 12,
        active: 67,
        returning: 45
      },
      responseTime: {
        average: 0.8,
        min: 0.2,
        max: 2.1
      },
      uptime: 99.9,
      errors: 2,
      chartData: [
        { date: '2024-01-14', messages: 45, users: 12 },
        { date: '2024-01-15', messages: 67, users: 18 },
        { date: '2024-01-16', messages: 89, users: 23 },
        { date: '2024-01-17', messages: 56, users: 15 },
        { date: '2024-01-18', messages: 78, users: 21 },
        { date: '2024-01-19', messages: 92, users: 25 },
        { date: '2024-01-20', messages: 45, users: 12 }
      ]
    };
  },

  getMockLogs(id, limit) {
    return [
      {
        id: 1,
        timestamp: '2024-01-20T15:30:00Z',
        level: 'info',
        message: 'Bot started successfully',
        source: 'bot-orchestrator'
      },
      {
        id: 2,
        timestamp: '2024-01-20T15:29:45Z',
        level: 'info',
        message: 'User /start command received',
        source: 'telegram-bot'
      },
      {
        id: 3,
        timestamp: '2024-01-20T15:29:30Z',
        level: 'warning',
        message: 'API rate limit approaching',
        source: 'api-client'
      },
      {
        id: 4,
        timestamp: '2024-01-20T15:29:15Z',
        level: 'error',
        message: 'Failed to send message to user 12345',
        source: 'telegram-bot'
      }
    ].slice(0, limit);
  }
};

export default botService;
