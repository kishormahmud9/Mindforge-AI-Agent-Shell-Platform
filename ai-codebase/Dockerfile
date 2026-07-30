# =============================================================================
# Stage 1: Build dependencies
# =============================================================================
FROM python:3.12-slim AS builder

WORKDIR /app

# Install build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies into a local directory
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# =============================================================================
# Stage 2: Production image
# =============================================================================
FROM python:3.12-slim AS production

LABEL maintainer="Jaysea AI Team"
LABEL description="Jaysea AI Service - FastAPI + OpenAI + Pinecone"

WORKDIR /app

# Security: Create non-root user
RUN groupadd -g 1001 aiuser && \
    useradd -r -u 1001 -g aiuser aiuser

# Copy installed Python packages from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY main.py .
COPY app ./app

# Change ownership
RUN chown -R aiuser:aiuser /app

# Switch to non-root user
USER aiuser

# Expose port
EXPOSE 8002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8002/')" || exit 1

# Run with uvicorn
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002", "--workers", "2", "--no-access-log"]
