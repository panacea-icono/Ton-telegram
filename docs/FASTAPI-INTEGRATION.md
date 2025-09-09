# FastAPI Integration - Panas Token Ecosystem

This document describes the FastAPI integration with Heroku, Docker, and Hugging Face for the Panacea Icono SA ecosystem.

## 🚀 FastAPI Backend

### Overview
The FastAPI service provides REST API endpoints with Hugging Face NLP integration, complementing the existing Node.js services.

### Endpoints

#### Health & Status
- `GET /` - Service root information
- `GET /health` - Health check endpoint
- `GET /api/v1/status` - Detailed API status

#### Hugging Face NLP Integration
- `POST /api/v1/huggingface/generate` - Text generation
- `POST /api/v1/huggingface/sentiment` - Sentiment analysis
- `POST /api/v1/huggingface/summarize` - Text summarization
- `GET /api/v1/integration/test` - Integration test endpoint

### Request Format
```json
{
  "text": "Your text here",
  "max_length": 100,
  "model_type": "text-generation"
}
```

### Response Format
```json
{
  "result": {
    "generated_text": "Generated response...",
    "confidence": 0.95
  },
  "model_type": "text-generation",
  "status": "success"
}
```

## 🐳 Docker Integration

### FastAPI Service
The FastAPI service is integrated into the existing Docker Compose setup:

```yaml
fastapi:
  build:
    context: .
    dockerfile: backend/fastapi/Dockerfile
  container_name: panas-fastapi
  ports:
    - '8000:8000'
  environment:
    - NODE_ENV=development
    - HOST=0.0.0.0
    - PORT=8000
```

### Running with Docker
```bash
# Run all services including FastAPI
docker-compose up -d

# Run only FastAPI service
docker-compose up -d fastapi

# View FastAPI logs
docker-compose logs -f fastapi
```

## ☁️ Heroku Integration

### Multi-Buildpack Support
The app uses both Node.js and Python buildpacks:

```json
{
  "buildpacks": [
    {"url": "heroku/nodejs"},
    {"url": "heroku/python"}
  ]
}
```

### Process Types
```
web: npm start
fastapi: cd backend/fastapi && python main.py
worker: npm run worker
telegram-bots: npm run bots:start
```

### Deployment
```bash
# Deploy to Heroku
git push heroku main

# Scale FastAPI process
heroku ps:scale fastapi=1

# View logs
heroku logs --tail -p fastapi
```

## 🤗 Hugging Face Integration

### Node.js Module
The existing Hugging Face module (`scripts/bots/modules/ai_huggingface.js`) provides extensive NLP capabilities for Telegram bots.

### FastAPI Endpoints
The FastAPI service exposes Hugging Face functionality via REST API, allowing external applications to access NLP features.

### Integration Pattern
```
Telegram Bot -> Node.js HF Module -> AI Processing
External App -> FastAPI Service -> AI Processing
```

## 🔧 Development

### Local Development
```bash
# Install dependencies
npm install
pip install -r requirements.txt

# Run all services in development mode
npm run dev

# Run only FastAPI in development
npm run dev:fastapi
```

### Environment Variables
```env
# FastAPI Configuration
HOST=0.0.0.0
PORT=8000
NODE_ENV=development

# Hugging Face (optional)
HUGGINGFACE_API_KEY=your_api_key_here
```

## 🧪 Testing

### Integration Tests
```bash
# Run integration tests
node tests/integration/technology-integration.test.js
```

### API Testing
```bash
# Test FastAPI service
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/status
```

### Docker Testing
```bash
# Test FastAPI in Docker
docker-compose up -d fastapi
curl http://localhost:8000/health
```

## 📋 Technology Stack Summary

✅ **Heroku**: Multi-buildpack deployment with Node.js and Python support
✅ **Docker**: Containerized FastAPI service integrated with existing stack  
✅ **Hugging Face**: Dual integration (Node.js module + FastAPI endpoints)
✅ **FastAPI**: REST API service with automatic documentation

## 🔗 Integration Points

1. **Heroku + FastAPI**: Multi-buildpack deployment
2. **Docker + FastAPI**: Containerized service in docker-compose
3. **Hugging Face + FastAPI**: NLP endpoints accessible via REST API
4. **All Technologies**: Unified ecosystem with shared configuration

## 📚 API Documentation

When running the FastAPI service, automatic documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`