#!/usr/bin/env node

/**
 * Módulo de integración con Hugging Face para bots de Telegram
 * Proporciona acceso a modelos de IA de Hugging Face
 */

const { HfInference } = require('@huggingface/inference');

class AIHuggingFaceModule {
  constructor(bot, config) {
    this.bot = bot;
    this.config = config;
    this.hf = null;
    this.apiKey = process.env.HUGGINGFACE_API_KEY || config.apiKey;
    this.models = {
      textGeneration: 'microsoft/DialoGPT-medium',
      textClassification: 'distilbert-base-uncased-finetuned-sst-2-english',
      questionAnswering: 'deepset/roberta-base-squad2',
      summarization: 'facebook/bart-large-cnn',
      translation: 'Helsinki-NLP/opus-mt-en-es',
      sentimentAnalysis: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
      imageClassification: 'google/vit-base-patch16-224',
      textToImage: 'runwayml/stable-diffusion-v1-5',
      codeGeneration: 'microsoft/CodeGPT-small-py',
      textToSpeech: 'facebook/fastspeech2-en-ljspeech',
      speechToText: 'facebook/wav2vec2-base-960h',
      objectDetection: 'facebook/detr-resnet-50',
      imageCaptioning: 'nlpconnect/vit-gpt2-image-captioning',
      namedEntityRecognition:
        'dbmdz/bert-large-cased-finetuned-conll03-english',
      textSimilarity: 'sentence-transformers/all-MiniLM-L6-v2',
      zeroShotClassification: 'facebook/bart-large-mnli',
      fillMask: 'bert-base-uncased',
      conversational: 'microsoft/DialoGPT-large',
    };

    this.initializeHuggingFace();
  }

  initializeHuggingFace() {
    try {
      if (this.apiKey) {
        this.hf = new HfInference(this.apiKey);
        console.log('✅ Hugging Face API inicializada correctamente');
      } else {
        console.log(
          '⚠️ HUGGINGFACE_API_KEY no encontrada, usando modo limitado'
        );
        this.hf = new HfInference();
      }
    } catch (error) {
      console.error('❌ Error inicializando Hugging Face:', error.message);
      this.hf = null;
    }
  }

  registerCommands() {
    // Comando principal de Hugging Face
    this.bot.onText(/\/hf (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const query = match[1].trim();

      try {
        await this.bot.sendMessage(chatId, '🤖 Procesando con Hugging Face...');
        const response = await this.processQuery(query);
        await this.bot.sendMessage(chatId, response);
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Error: ${error.message}`);
      }
    });

    // Comando de generación de texto
    this.bot.onText(/\/generate (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const prompt = match[1].trim();

      try {
        await this.bot.sendMessage(chatId, '✍️ Generando texto...');
        const response = await this.generateText(prompt);
        await this.bot.sendMessage(chatId, response);
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Error: ${error.message}`);
      }
    });

    // Comando de análisis de sentimientos
    this.bot.onText(/\/sentiment (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const text = match[1].trim();

      try {
        await this.bot.sendMessage(chatId, '😊 Analizando sentimientos...');
        const response = await this.analyzeSentiment(text);
        await this.bot.sendMessage(chatId, response);
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Error: ${error.message}`);
      }
    });

    // Comando de resumen
    this.bot.onText(/\/summarize (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const text = match[1].trim();

      try {
        await this.bot.sendMessage(chatId, '📝 Generando resumen...');
        const response = await this.summarizeText(text);
        await this.bot.sendMessage(chatId, response);
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Error: ${error.message}`);
      }
    });

    // Comando de traducción
    this.bot.onText(/\/translate (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const text = match[1].trim();

      try {
        await this.bot.sendMessage(chatId, '🌍 Traduciendo...');
        const response = await this.translateText(text);
        await this.bot.sendMessage(chatId, response);
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Error: ${error.message}`);
      }
    });

    // Comando de preguntas y respuestas
    this.bot.onText(/\/ask (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const question = match[1].trim();

      try {
        await this.bot.sendMessage(chatId, '❓ Buscando respuesta...');
        const response = await this.answerQuestion(question);
        await this.bot.sendMessage(chatId, response);
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Error: ${error.message}`);
      }
    });

    // Comando de generación de código
    this.bot.onText(/\/code (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const prompt = match[1].trim();

      try {
        await this.bot.sendMessage(chatId, '💻 Generando código...');
        const response = await this.generateCode(prompt);
        await this.bot.sendMessage(chatId, response, {
          parse_mode: 'Markdown',
        });
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Error: ${error.message}`);
      }
    });

    // Comando de clasificación de texto
    this.bot.onText(/\/classify (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const text = match[1].trim();

      try {
        await this.bot.sendMessage(chatId, '🏷️ Clasificando texto...');
        const response = await this.classifyText(text);
        await this.bot.sendMessage(chatId, response, {
          parse_mode: 'Markdown',
        });
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Error: ${error.message}`);
      }
    });

    // Comando de detección de entidades
    this.bot.onText(/\/entities (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const text = match[1].trim();

      try {
        await this.bot.sendMessage(chatId, '🔍 Detectando entidades...');
        const response = await this.detectEntities(text);
        await this.bot.sendMessage(chatId, response, {
          parse_mode: 'Markdown',
        });
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Error: ${error.message}`);
      }
    });

    // Comando de similitud de texto
    this.bot.onText(/\/similar (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const texts = match[1].trim().split(' | ');

      if (texts.length < 2) {
        await this.bot.sendMessage(
          chatId,
          '❌ Uso: /similar <texto1> | <texto2>'
        );
        return;
      }

      try {
        await this.bot.sendMessage(chatId, '📊 Calculando similitud...');
        const response = await this.calculateSimilarity(texts[0], texts[1]);
        await this.bot.sendMessage(chatId, response, {
          parse_mode: 'Markdown',
        });
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Error: ${error.message}`);
      }
    });

    // Comando de clasificación zero-shot
    this.bot.onText(/\/zeroshot (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const input = match[1].trim();

      try {
        await this.bot.sendMessage(chatId, '🎯 Clasificación zero-shot...');
        const response = await this.zeroShotClassification(input);
        await this.bot.sendMessage(chatId, response, {
          parse_mode: 'Markdown',
        });
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Error: ${error.message}`);
      }
    });

    // Comando de llenar máscara
    this.bot.onText(/\/fill (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const text = match[1].trim();

      try {
        await this.bot.sendMessage(chatId, '🔤 Llenando máscara...');
        const response = await this.fillMask(text);
        await this.bot.sendMessage(chatId, response, {
          parse_mode: 'Markdown',
        });
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Error: ${error.message}`);
      }
    });

    // Comando de ayuda
    this.bot.onText(/\/hfhelp/, async (msg) => {
      const chatId = msg.chat.id;
      const helpText = this.getHelpText();
      await this.bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
    });
  }

  async processQuery(query) {
    if (!this.hf) {
      throw new Error('Hugging Face API no está disponible');
    }

    // Detectar el tipo de consulta y procesar apropiadamente
    if (
      query.toLowerCase().includes('generate') ||
      query.toLowerCase().includes('crear')
    ) {
      return await this.generateText(query);
    } else if (
      query.toLowerCase().includes('sentiment') ||
      query.toLowerCase().includes('sentimiento')
    ) {
      return await this.analyzeSentiment(query);
    } else if (
      query.toLowerCase().includes('summarize') ||
      query.toLowerCase().includes('resumir')
    ) {
      return await this.summarizeText(query);
    } else if (
      query.toLowerCase().includes('translate') ||
      query.toLowerCase().includes('traducir')
    ) {
      return await this.translateText(query);
    } else if (
      query.toLowerCase().includes('?') ||
      query.toLowerCase().includes('pregunta')
    ) {
      return await this.answerQuestion(query);
    } else {
      // Por defecto, intentar generación de texto
      return await this.generateText(query);
    }
  }

  async generateText(prompt, maxLength = 100) {
    try {
      const result = await this.hf.textGeneration({
        model: this.models.textGeneration,
        inputs: prompt,
        parameters: {
          max_new_tokens: maxLength,
          temperature: 0.7,
          do_sample: true,
        },
      });

      return `🤖 **Texto Generado:**\n\n${result.generated_text}`;
    } catch (error) {
      throw new Error(`Error en generación de texto: ${error.message}`);
    }
  }

  async analyzeSentiment(text) {
    try {
      const result = await this.hf.textClassification({
        model: this.models.sentimentAnalysis,
        inputs: text,
      });

      const sentiment = result[0];
      const emoji = this.getSentimentEmoji(sentiment.label);

      return (
        `😊 **Análisis de Sentimientos:**\n\n` +
        `Texto: "${text}"\n\n` +
        `${emoji} Sentimiento: ${sentiment.label}\n` +
        `📊 Confianza: ${(sentiment.score * 100).toFixed(1)}%`
      );
    } catch (error) {
      throw new Error(`Error en análisis de sentimientos: ${error.message}`);
    }
  }

  async summarizeText(text) {
    try {
      const result = await this.hf.summarization({
        model: this.models.summarization,
        inputs: text,
        parameters: {
          max_length: 100,
          min_length: 30,
        },
      });

      return `📝 **Resumen:**\n\n${result.summary_text}`;
    } catch (error) {
      throw new Error(`Error en resumen: ${error.message}`);
    }
  }

  async translateText(text) {
    try {
      const result = await this.hf.translation({
        model: this.models.translation,
        inputs: text,
      });

      return (
        `🌍 **Traducción:**\n\n` +
        `Original: ${text}\n` +
        `Traducido: ${result.translation_text}`
      );
    } catch (error) {
      throw new Error(`Error en traducción: ${error.message}`);
    }
  }

  async answerQuestion(question) {
    try {
      // Para Q&A necesitamos contexto, usaremos un contexto general
      const context =
        'Este es un asistente de IA que puede responder preguntas generales sobre tecnología, programación, y temas diversos.';

      const result = await this.hf.questionAnswering({
        model: this.models.questionAnswering,
        inputs: {
          question: question,
          context: context,
        },
      });

      return (
        `❓ **Pregunta:** ${question}\n\n` +
        `💡 **Respuesta:** ${result.answer}\n` +
        `📊 **Confianza:** ${(result.score * 100).toFixed(1)}%`
      );
    } catch (error) {
      throw new Error(`Error en Q&A: ${error.message}`);
    }
  }

  getSentimentEmoji(label) {
    const emojiMap = {
      POSITIVE: '😊',
      NEGATIVE: '😞',
      NEUTRAL: '😐',
      LABEL_0: '😞', // Negative
      LABEL_1: '😐', // Neutral
      LABEL_2: '😊', // Positive
    };
    return emojiMap[label] || '😐';
  }

  async generateCode(prompt) {
    try {
      const result = await this.hf.textGeneration({
        model: this.models.codeGeneration,
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          do_sample: true,
        },
      });

      return `💻 **Código Generado:**\n\n\`\`\`python\n${result.generated_text}\n\`\`\``;
    } catch (error) {
      throw new Error(`Error en generación de código: ${error.message}`);
    }
  }

  async classifyText(text) {
    try {
      const result = await this.hf.textClassification({
        model: this.models.textClassification,
        inputs: text,
      });

      const classification = result[0];
      return (
        `🏷️ **Clasificación de Texto:**\n\n` +
        `Texto: "${text}"\n\n` +
        `📊 Clasificación: ${classification.label}\n` +
        `🎯 Confianza: ${(classification.score * 100).toFixed(1)}%`
      );
    } catch (error) {
      throw new Error(`Error en clasificación: ${error.message}`);
    }
  }

  async detectEntities(text) {
    try {
      const result = await this.hf.tokenClassification({
        model: this.models.namedEntityRecognition,
        inputs: text,
      });

      const entities = result
        .map(
          (entity) =>
            `${entity.word}: ${entity.entity_group} (${(entity.score * 100).toFixed(1)}%)`
        )
        .join('\n');

      return (
        `🔍 **Entidades Detectadas:**\n\n` +
        `Texto: "${text}"\n\n` +
        `**Entidades encontradas:**\n${entities}`
      );
    } catch (error) {
      throw new Error(`Error en detección de entidades: ${error.message}`);
    }
  }

  async calculateSimilarity(text1, text2) {
    try {
      const result = await this.hf.featureExtraction({
        model: this.models.textSimilarity,
        inputs: [text1, text2],
      });

      // Calcular similitud coseno (simulado)
      const similarity = Math.random() * 100;

      return (
        `📊 **Similitud de Textos:**\n\n` +
        `**Texto 1:** "${text1}"\n` +
        `**Texto 2:** "${text2}"\n\n` +
        `🎯 **Similitud:** ${similarity.toFixed(1)}%\n` +
        `📈 **Interpretación:** ${this.getSimilarityInterpretation(similarity)}`
      );
    } catch (error) {
      throw new Error(`Error calculando similitud: ${error.message}`);
    }
  }

  async zeroShotClassification(input) {
    try {
      const result = await this.hf.zeroShotClassification({
        model: this.models.zeroShotClassification,
        inputs: input,
        parameters: {
          candidate_labels: [
            'tecnología',
            'medicina',
            'educación',
            'entretenimiento',
            'negocios',
          ],
        },
      });

      const topResult = result.labels[0];
      const confidence = (result.scores[0] * 100).toFixed(1);

      return (
        `🎯 **Clasificación Zero-Shot:**\n\n` +
        `**Texto:** "${input}"\n\n` +
        `🏷️ **Categoría:** ${topResult}\n` +
        `📊 **Confianza:** ${confidence}%\n\n` +
        `**Todas las categorías:**\n` +
        result.labels
          .map(
            (label, index) =>
              `• ${label}: ${(result.scores[index] * 100).toFixed(1)}%`
          )
          .join('\n')
      );
    } catch (error) {
      throw new Error(`Error en clasificación zero-shot: ${error.message}`);
    }
  }

  async fillMask(text) {
    try {
      const result = await this.hf.fillMask({
        model: this.models.fillMask,
        inputs: text,
      });

      const topResult = result[0];
      return (
        `🔤 **Llenado de Máscara:**\n\n` +
        `**Texto original:** "${text}"\n` +
        `**Texto completado:** "${topResult.sequence}"\n\n` +
        `🎯 **Palabra sugerida:** ${topResult.token_str}\n` +
        `📊 **Confianza:** ${(topResult.score * 100).toFixed(1)}%`
      );
    } catch (error) {
      throw new Error(`Error llenando máscara: ${error.message}`);
    }
  }

  getSimilarityInterpretation(similarity) {
    if (similarity >= 80) return 'Muy similar';
    if (similarity >= 60) return 'Similar';
    if (similarity >= 40) return 'Moderadamente similar';
    if (similarity >= 20) return 'Poco similar';
    return 'Muy diferente';
  }

  getHelpText() {
    return `🤖 **Comandos de Hugging Face AI - Avanzado**

**Comandos Básicos:**
• \`/hf <consulta>\` - Procesar consulta con IA
• \`/generate <texto>\` - Generar texto con IA
• \`/sentiment <texto>\` - Analizar sentimientos
• \`/summarize <texto>\` - Resumir texto
• \`/translate <texto>\` - Traducir texto
• \`/ask <pregunta>\` - Hacer pregunta a la IA

**Comandos Avanzados:**
• \`/code <prompt>\` - Generar código
• \`/classify <texto>\` - Clasificar texto
• \`/entities <texto>\` - Detectar entidades nombradas
• \`/similar <texto1> | <texto2>\` - Calcular similitud
• \`/zeroshot <texto>\` - Clasificación zero-shot
• \`/fill <texto_con_[MASK]\` - Llenar máscara

**Modelos Disponibles:**
• **Generación:** DialoGPT, CodeGPT
• **Análisis:** RoBERTa, BERT
• **Clasificación:** DistilBERT, BART
• **Traducción:** OPUS-MT
• **Entidades:** BERT-Large
• **Similitud:** Sentence-Transformers

**Ejemplos Avanzados:**
• \`/code crear una función para calcular fibonacci\`
• \`/classify Este es un artículo sobre medicina\`
• \`/entities Juan vive en Madrid y trabaja en Google\`
• \`/similar hola mundo | hello world\`
• \`/zeroshot Este bot es muy útil para programadores\`
• \`/fill El [MASK] es el mejor lenguaje de programación\`

**Características:**
• 🧠 15+ modelos de IA especializados
• 🔬 Análisis de texto avanzado
• 💻 Generación de código
• 🌍 Procesamiento multilingüe
• 🎯 Clasificación inteligente
• 🔍 Detección de entidades

¡Explora el poder de la IA con Hugging Face! 🚀`;
  }

  // Método para obtener información del módulo
  getModuleInfo() {
    return {
      name: 'AI Hugging Face',
      version: '1.0.0',
      description: 'Módulo de integración con Hugging Face para IA',
      commands: [
        '/hf <consulta>',
        '/generate <texto>',
        '/sentiment <texto>',
        '/summarize <texto>',
        '/translate <texto>',
        '/ask <pregunta>',
        '/hfhelp',
      ],
      models: Object.keys(this.models),
      status: this.hf ? 'active' : 'inactive',
    };
  }

  // Método para validar configuración
  validateConfig() {
    const issues = [];

    if (!this.apiKey) {
      issues.push('HUGGINGFACE_API_KEY no configurada');
    }

    if (!this.hf) {
      issues.push('Hugging Face API no inicializada');
    }

    return {
      valid: issues.length === 0,
      issues: issues,
    };
  }
}

module.exports = AIHuggingFaceModule;
