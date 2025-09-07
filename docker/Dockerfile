# =============================================================================
# PANAS TOKEN ECOSYSTEM - DOCKERFILE
# Panacea | Icono SA
# =============================================================================

# Multi-stage build for production optimization
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl \
    && rm -rf /var/cache/apk/*

# =============================================================================
# DEPENDENCIES STAGE
# =============================================================================
FROM base AS dependencies

# Copy package files
COPY package*.json ./
COPY .npmrc* ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# =============================================================================
# BUILD STAGE
# =============================================================================
FROM base AS build

# Copy package files
COPY package*.json ./
COPY .npmrc* ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# =============================================================================
# PRODUCTION STAGE
# =============================================================================
FROM node:18-alpine AS production

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S panas -u 1001

# Set working directory
WORKDIR /app

# Install production dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/config ./config

# Copy environment template
COPY --from=build /app/env.example ./

# Set ownership
RUN chown -R panas:nodejs /app
USER panas

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]

# =============================================================================
# METADATA
# =============================================================================
LABEL maintainer="Panacea | Icono SA <info@iconosa.com>"
LABEL description="Panas Token Ecosystem - Multi-chain blockchain platform"
LABEL version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/panacea-icono/Ton-telegram"
LABEL org.opencontainers.image.licenses="MIT"
