# =============================================================================
# Stage 1: Base - Install production dependencies only
# =============================================================================
FROM node:22-alpine AS base

# Install system dependencies needed for Prisma/bcrypt
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including dev for Prisma generation)
RUN npm ci --frozen-lockfile

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate


# =============================================================================
# Stage 2: Production build
# =============================================================================
FROM node:22-alpine AS production

LABEL maintainer="Jaysea AI Team"
LABEL description="Jaysea Backend - Node.js + Express + Prisma + PostgreSQL"

# Security: Install openssl for Prisma + tini for graceful shutdown
RUN apk add --no-cache libc6-compat openssl tini

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

# Copy node_modules and generated prisma client from base
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Copy application source
COPY src ./src
COPY package.json ./

# Copy and set entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create uploads directory with correct permissions
RUN mkdir -p uploads && \
    chown -R nodeuser:nodejs /app && \
    chown -R nodeuser:nodejs uploads

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 8001

# Use tini as init process for proper signal handling
ENTRYPOINT ["/sbin/tini", "--", "/docker-entrypoint.sh"]
