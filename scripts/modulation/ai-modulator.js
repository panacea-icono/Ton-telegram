#!/usr/bin/env node

/**
 * =============================================================================
 * PANACEA ICONO SA - AI MODULATOR
 * =============================================================================
 * Modular AI service integration and management
 * =============================================================================
 */

// Conditional imports to avoid issues in test environments
let HfInference, axios;

try {
  const huggingface = require('@huggingface/inference');
  HfInference = huggingface.HfInference;
  axios = require('axios');
} catch (error) {
  // Module not available or failed to load
  console.warn('Some AI modules failed to load:', error.message);
}

class AIModulator {
  constructor(config = {}) {
    this.config = {
      providers: config.providers || ['openai', 'huggingface'],
      models: {
        openai: {
          chat: 'gpt-4o-mini',
          embedding: 'text-embedding-ada-002'
        },
        huggingface: {
          chat: 'microsoft/DialoGPT-large',
          medical: 'dmis-lab/biobert-base-cased-v1.1',
          embedding: 'sentence-transformers/all-MiniLM-L6-v2'
        }
      },
      apiKeys: {
        openai: process.env.OPENAI_API_KEY,
        huggingface: process.env.HUGGINGFACE_API_KEY
      },
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
      ...config
    };

    this.clients = {};
    this.isRunning = false;
    this.requestCache = new Map();
  }

  async start() {
    console.log('🚀 Starting AI Modulator...');
    
    try {
      // Initialize AI providers
      await this.initializeProviders();
      
      // Verify connections
      await this.verifyProviders();
      
      this.isRunning = true;
      this.startCacheCleanup();
      
      console.log('✅ AI Modulator started successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to start AI Modulator:', error.message);
      throw error;
    }
  }

  async stop() {
    console.log('🛑 Stopping AI Modulator...');
    
    try {
      // Clear cache cleanup interval
      if (this.cacheCleanupInterval) {
        clearInterval(this.cacheCleanupInterval);
      }

      // Clear cache
      this.requestCache.clear();
      
      this.isRunning = false;
      console.log('✅ AI Modulator stopped successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to stop AI Modulator:', error.message);
      throw error;
    }
  }

  async initializeProviders() {
    console.log('🤖 Initializing AI providers...');

    // Initialize OpenAI
    if (this.config.providers.includes('openai') && this.config.apiKeys.openai) {
      try {
        // We'll use axios for OpenAI API calls
        this.clients.openai = {
          baseURL: 'https://api.openai.com/v1',
          headers: {
            'Authorization': `Bearer ${this.config.apiKeys.openai}`,
            'Content-Type': 'application/json'
          }
        };
        console.log('✅ OpenAI client initialized');
      } catch (error) {
        console.error('❌ Failed to initialize OpenAI client:', error.message);
      }
    }

    // Initialize Hugging Face
    if (this.config.providers.includes('huggingface') && this.config.apiKeys.huggingface) {
      try {
        this.clients.huggingface = new HfInference(this.config.apiKeys.huggingface);
        console.log('✅ Hugging Face client initialized');
      } catch (error) {
        console.error('❌ Failed to initialize Hugging Face client:', error.message);
      }
    }
  }

  async verifyProviders() {
    console.log('🔍 Verifying AI provider connections...');
    
    for (const provider of this.config.providers) {
      try {
        const isHealthy = await this.checkProviderHealth(provider);
        if (isHealthy) {
          console.log(`✅ ${provider.toUpperCase()} connection verified`);
        } else {
          console.log(`⚠️  ${provider.toUpperCase()} connection warning`);
        }
      } catch (error) {
        console.log(`❌ ${provider.toUpperCase()} connection failed:`, error.message);
      }
    }
  }

  async checkHealth() {
    if (!this.isRunning) return false;
    
    try {
      const healthChecks = await Promise.allSettled(
        this.config.providers.map(provider => this.checkProviderHealth(provider))
      );

      const healthyProviders = healthChecks.filter(result => 
        result.status === 'fulfilled' && result.value
      ).length;

      // Consider healthy if at least one provider is working
      return healthyProviders > 0;
    } catch (error) {
      console.error('AI health check failed:', error.message);
      return false;
    }
  }

  async checkProviderHealth(provider) {
    try {
      switch (provider) {
        case 'openai':
          return await this.checkOpenAIHealth();
        case 'huggingface':
          return await this.checkHuggingFaceHealth();
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  async checkOpenAIHealth() {
    if (!this.clients.openai) return false;

    try {
      const response = await axios.get(
        `${this.clients.openai.baseURL}/models`,
        { 
          headers: this.clients.openai.headers,
          timeout: 10000
        }
      );
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async checkHuggingFaceHealth() {
    if (!this.clients.huggingface) return false;

    try {
      // Try a simple text generation request
      await this.clients.huggingface.textGeneration({
        model: 'gpt2',
        inputs: 'Hello',
        parameters: { max_length: 10 }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Cache management
  getCacheKey(provider, operation, input) {
    const inputHash = Buffer.from(JSON.stringify(input)).toString('base64').slice(0, 20);
    return `${provider}:${operation}:${inputHash}`;
  }

  getFromCache(cacheKey) {
    const cached = this.requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes cache
      return cached.data;
    }
    return null;
  }

  setCache(cacheKey, data) {
    this.requestCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  startCacheCleanup() {
    this.cacheCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.requestCache.entries()) {
        if (now - value.timestamp > 300000) { // 5 minutes
          this.requestCache.delete(key);
        }
      }
    }, 60000); // Clean every minute
  }

  // AI Operations
  async generateText(prompt, options = {}) {
    const provider = options.provider || 'openai';
    const cacheKey = this.getCacheKey(provider, 'text', { prompt, options });
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    let result;
    try {
      switch (provider) {
        case 'openai':
          result = await this.generateTextOpenAI(prompt, options);
          break;
        case 'huggingface':
          result = await this.generateTextHuggingFace(prompt, options);
          break;
        default:
          throw new Error(`Provider not supported: ${provider}`);
      }

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      // Try fallback provider
      const fallbackProvider = provider === 'openai' ? 'huggingface' : 'openai';
      if (this.config.providers.includes(fallbackProvider)) {
        try {
          result = await this.generateText(prompt, { ...options, provider: fallbackProvider });
          return result;
        } catch (fallbackError) {
          throw new Error(`Both providers failed: ${error.message}, ${fallbackError.message}`);
        }
      }
      throw error;
    }
  }

  async generateTextOpenAI(prompt, options = {}) {
    if (!this.clients.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const requestData = {
      model: options.model || this.config.models.openai.chat,
      messages: [
        {
          role: 'system',
          content: options.systemPrompt || 'You are a helpful assistant for the Panacea medical ecosystem.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: options.maxTokens || 150,
      temperature: options.temperature || 0.7
    };

    try {
      const response = await axios.post(
        `${this.clients.openai.baseURL}/chat/completions`,
        requestData,
        {
          headers: this.clients.openai.headers,
          timeout: this.config.timeout
        }
      );

      return {
        provider: 'openai',
        text: response.data.choices[0].message.content,
        usage: response.data.usage,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`OpenAI request failed: ${error.message}`);
    }
  }

  async generateTextHuggingFace(prompt, options = {}) {
    if (!this.clients.huggingface) {
      throw new Error('Hugging Face client not initialized');
    }

    try {
      const result = await this.clients.huggingface.textGeneration({
        model: options.model || this.config.models.huggingface.chat,
        inputs: prompt,
        parameters: {
          max_length: options.maxTokens || 150,
          temperature: options.temperature || 0.7,
          do_sample: true
        }
      });

      return {
        provider: 'huggingface',
        text: typeof result === 'string' ? result : result.generated_text || result[0]?.generated_text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Hugging Face request failed: ${error.message}`);
    }
  }

  async generateMedicalResponse(prompt, patientContext = {}) {
    const systemPrompt = `
    You are Dr. Tapia, a medical AI assistant in the Panacea ecosystem. 
    You provide professional medical guidance while emphasizing the importance of consulting with healthcare professionals.
    
    Patient context: ${JSON.stringify(patientContext)}
    
    Guidelines:
    - Be professional and empathetic
    - Provide helpful medical information
    - Always recommend consulting with a healthcare professional
    - Use clear, understandable language
    - Respect patient privacy and confidentiality
    `;

    return await this.generateText(prompt, {
      provider: 'openai', // Prefer OpenAI for medical responses
      systemPrompt,
      maxTokens: 300,
      temperature: 0.3 // Lower temperature for more consistent medical advice
    });
  }

  async generateEmbedding(text, provider = 'openai') {
    const cacheKey = this.getCacheKey(provider, 'embedding', { text });
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    let result;
    try {
      switch (provider) {
        case 'openai':
          result = await this.generateEmbeddingOpenAI(text);
          break;
        case 'huggingface':
          result = await this.generateEmbeddingHuggingFace(text);
          break;
        default:
          throw new Error(`Provider not supported: ${provider}`);
      }

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  async generateEmbeddingOpenAI(text) {
    if (!this.clients.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const requestData = {
      model: this.config.models.openai.embedding,
      input: text
    };

    try {
      const response = await axios.post(
        `${this.clients.openai.baseURL}/embeddings`,
        requestData,
        {
          headers: this.clients.openai.headers,
          timeout: this.config.timeout
        }
      );

      return {
        provider: 'openai',
        embedding: response.data.data[0].embedding,
        usage: response.data.usage,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`OpenAI embedding failed: ${error.message}`);
    }
  }

  async generateEmbeddingHuggingFace(text) {
    if (!this.clients.huggingface) {
      throw new Error('Hugging Face client not initialized');
    }

    try {
      const result = await this.clients.huggingface.featureExtraction({
        model: this.config.models.huggingface.embedding,
        inputs: text
      });

      return {
        provider: 'huggingface',
        embedding: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Hugging Face embedding failed: ${error.message}`);
    }
  }

  async analyzeText(text, analysisType = 'sentiment') {
    if (!this.clients.huggingface) {
      throw new Error('Hugging Face client required for text analysis');
    }

    try {
      let result;
      switch (analysisType) {
        case 'sentiment':
          result = await this.clients.huggingface.textClassification({
            model: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
            inputs: text
          });
          break;
        case 'emotion':
          result = await this.clients.huggingface.textClassification({
            model: 'j-hartmann/emotion-english-distilroberta-base',
            inputs: text
          });
          break;
        default:
          throw new Error(`Analysis type not supported: ${analysisType}`);
      }

      return {
        provider: 'huggingface',
        analysis: result,
        type: analysisType,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Text analysis failed: ${error.message}`);
    }
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
        console.log(`AI Health: ${health ? '✅ Healthy' : '❌ Unhealthy'}`);
        break;
      case 'status':
        const status = {
          isRunning: this.isRunning,
          providers: this.config.providers,
          clients: Object.keys(this.clients),
          cacheSize: this.requestCache.size
        };
        console.log(JSON.stringify(status, null, 2));
        break;
      case 'generate':
        if (args.length >= 1) {
          const prompt = args.join(' ');
          const result = await this.generateText(prompt);
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('Usage: generate <prompt>');
        }
        break;
      case 'medical':
        if (args.length >= 1) {
          const prompt = args.join(' ');
          const result = await this.generateMedicalResponse(prompt);
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('Usage: medical <medical question>');
        }
        break;
      case 'analyze':
        if (args.length >= 1) {
          const text = args.join(' ');
          const result = await this.analyzeText(text);
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('Usage: analyze <text>');
        }
        break;
      default:
        console.log('Available commands: start, stop, health, status, generate <prompt>, medical <question>, analyze <text>');
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2] || 'status';
  const args = process.argv.slice(3);

  try {
    const modulator = new AIModulator();
    await modulator.executeCommand(command, ...args);
  } catch (error) {
    console.error('❌ AI Modulator error:', error.message);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = AIModulator;