# =============================================================================
# Stage 1: Install dependencies
# =============================================================================
FROM node:22-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile


# =============================================================================
# Stage 2: Build
# =============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build argument for API URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


# =============================================================================
# Stage 3: Production runner
# =============================================================================
FROM node:22-alpine AS runner

LABEL maintainer="Jaysea AI Team"
LABEL description="Jaysea Frontend - Next.js"

WORKDIR /app

# Security: non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy public assets
COPY --from=builder /app/public ./public

# Copy build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
