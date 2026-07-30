#!/bin/sh
# =============================================================================
# docker-entrypoint.sh
# Backend Startup Script - Jaysea Platform
# =============================================================================
# Purpose:
#   1. Wait for PostgreSQL to be ready
#   2. Run Prisma migrations (safe to run multiple times)
#   3. Start the Node.js application
# =============================================================================

set -e

echo "========================================="
echo " Jaysea Backend Startup"
echo "========================================="

# -------------------------------------------------
# Function: wait_for_service
# Waits for a TCP host:port to become available
# -------------------------------------------------
wait_for_service() {
    HOST=$1
    PORT=$2
    MAX_TRIES=${3:-30}
    COUNT=0

    echo "⏳ Waiting for $HOST:$PORT to be ready..."

    while ! nc -z "$HOST" "$PORT" 2>/dev/null; do
        COUNT=$((COUNT + 1))
        if [ "$COUNT" -ge "$MAX_TRIES" ]; then
            echo "❌ Timeout: $HOST:$PORT did not become available after ${MAX_TRIES}s"
            exit 1
        fi
        echo "   ... attempt $COUNT/$MAX_TRIES"
        sleep 1
    done

    echo "✅ $HOST:$PORT is ready!"
}

# Install netcat for health checks
apk add --no-cache netcat-openbsd 2>/dev/null || true

# -------------------------------------------------
# Step 1: Wait for PostgreSQL
# -------------------------------------------------
if [ -n "$DATABASE_URL" ]; then
    # Extract host and port from DATABASE_URL
    # Format: postgresql://user:pass@host:port/db
    DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')
    DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|.*:([0-9]+)/.*|\1|')
    DB_PORT=${DB_PORT:-5432}

    wait_for_service "$DB_HOST" "$DB_PORT" 60
else
    echo "⚠️ DATABASE_URL not set - skipping DB wait"
fi

# -------------------------------------------------
# Step 2: Wait for Redis
# -------------------------------------------------
if [ -n "$REDIS_URL" ]; then
    REDIS_HOST=$(echo "$REDIS_URL" | sed -E 's|redis://([^:/]+).*|\1|')
    REDIS_PORT=$(echo "$REDIS_URL" | sed -E 's|redis://[^:]+:([0-9]+).*|\1|')
    REDIS_PORT=${REDIS_PORT:-6379}

    wait_for_service "$REDIS_HOST" "$REDIS_PORT" 30
else
    echo "⚠️ REDIS_URL not set - skipping Redis wait"
fi

# -------------------------------------------------
# Step 3: Run Prisma Migrations
# -------------------------------------------------
echo ""
echo "📦 Running Prisma migrations..."
npx prisma migrate deploy
echo "✅ Migrations applied successfully"

# -------------------------------------------------
# Step 4: Start the Application
# -------------------------------------------------
echo ""
echo "🚀 Starting Jaysea Backend..."
echo "========================================="

exec node src/server.js
