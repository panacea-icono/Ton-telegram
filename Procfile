# =============================================================================
# PANAS TOKEN ECOSYSTEM - HEROKU PROCFILE
# Panacea | Icono SA
# =============================================================================

# Web process - Main Node.js application
web: npm start

# FastAPI process - Python API backend
fastapi: cd backend/fastapi && python main.py

# Worker process - Background tasks
worker: npm run worker

# Telegram bots process
telegram-bots: npm run bots:start

# Release process - Database migrations
release: npm run migrate