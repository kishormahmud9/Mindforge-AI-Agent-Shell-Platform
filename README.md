# Mindforge AI-Agent Shell Platform

> A production-ready multi-agent conversational shell platform. Users interact with AI personas (agents) via persistent chat sessions. The AI delivers personalized, context-aware responses using Retrieval-Augmented Generation (RAG) backed by Pinecone vector memory.

---

## Architecture

```
Browser → Nginx (80/443) → Frontend (Next.js :3000)
                        → Backend (Express :8001) ←→ PostgreSQL / Redis
                                      ↕
                              AI Service (FastAPI :8002)
                                      ↕
                            OpenAI API + Pinecone Cloud
```

**Five services. One Docker Compose file. Zero manual wiring.**

| Service | Technology | Port |
|---------|-----------|------|
| Frontend | Next.js 15 (React) | 3000 (internal) |
| Backend | Node.js 22 + Express + Prisma | 8001 (internal) |
| AI Service | Python 3.12 + FastAPI + OpenAI | 8002 (internal) |
| PostgreSQL | Postgres 16 Alpine | 5432 (internal) |
| Redis | Redis 7 Alpine | 6379 (internal) |
| Nginx | nginx 1.27 Alpine | **80, 443 (public)** |

---

## Quick Start (Docker Production)

### Prerequisites
- Docker Engine 24+
- Docker Compose V2
- OpenAI API key
- Pinecone account + API key

### 1. Clone & Configure

```bash
git clone <your-repo-url>
cd mindforge-ai-agent-shell-platform

# Create your environment file from template
cp .env.example .env
```

### 2. Edit `.env`

Open `.env` and fill in all required values:

```bash
# Required - Generate with: openssl rand -hex 64
JWT_SECRET_TOKEN=<generate-a-secret>
JWT_REFRESH_TOKEN=<generate-another-secret>

# Required - Database
DB_PASSWORD=<choose-a-strong-password>

# Required - Redis
REDIS_PASSWORD=<choose-a-password>

# Required - External APIs
OPENAI_API_KEY=sk-proj-...
PINECONE_API_KEY=...

# Required - Public-facing URL
NEXT_PUBLIC_API_URL=http://yourdomain.com/api
BACKEND_URL=http://yourdomain.com
FRONT_END_URL=http://yourdomain.com
```

### 3. Build & Launch

```bash
# Build all images and start all services
docker compose up -d --build

# Monitor startup (wait for all services to show as healthy)
docker compose ps

# Watch logs (all services)
docker compose logs -f

# Watch logs (specific service)
docker compose logs -f backend
```

### 4. Verify Deployment

```bash
# Check all containers are healthy
docker compose ps

# Test the API
curl http://localhost/api/

# Test the frontend
curl http://localhost/
```

---

## Quick Start (Development)

### Prerequisites
- Node.js 22+
- Python 3.12+
- PostgreSQL 16+
- Redis 7+

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your local DATABASE_URL, etc.

npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed      # Create admin + sample agents

npm run dev             # Starts with nodemon on :8001
```

### AI Service

```bash
cd ai-codebase
cp .env.example .env
# Edit .env with your OpenAI and Pinecone keys

python -m venv .venv
.venv/Scripts/activate  # Windows
source .venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
uvicorn main:app --reload --port 8002
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local: NEXT_PUBLIC_API_URL=http://localhost:8001/api

npm install
npm run dev             # Starts on :3000
```

---

## Development with Docker (Hot Reload)

```bash
# Use the dev overlay — source bind mounts enable hot reload
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This exposes:
- Frontend at `http://localhost:3000` (hot module replacement)
- Backend at `http://localhost:8001` (nodemon)
- AI Service at `http://localhost:8002` (uvicorn --reload)
- PostgreSQL at `localhost:5432`
- Redis at `localhost:6379`

---

## Environment Variables

### Backend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `REDIS_URL` | ✅ | — | Redis connection string |
| `JWT_SECRET_TOKEN` | ✅ | — | Access token signing key (min 32 chars) |
| `JWT_REFRESH_TOKEN` | ✅ | — | Refresh token signing key (min 32 chars) |
| `JWT_EXPIRES_IN` | — | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | — | `7d` | Refresh token TTL |
| `PORT` | — | `8001` | Server port |
| `BACKEND_URL` | ✅ | — | Public backend URL (for file links) |
| `FRONT_END_URL` | ✅ | — | Frontend URL (CORS + OAuth) |
| `SMTP_HOST` | ✅ | — | SMTP host for OTP emails |
| `SMTP_PORT` | — | `587` | SMTP port |
| `SMTP_USER` | ✅ | — | SMTP username |
| `SMTP_PASS` | ✅ | — | SMTP password / app password |
| `SMTP_FROM` | ✅ | — | From email address |
| `GOOGLE_CLIENT_ID` | Optional | — | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | — | Google OAuth Client Secret |
| `GOOGLE_CALLBACK_URL` | Optional | — | Google OAuth redirect URL |
| `AI_URL` | ✅ | — | AI service URL (internal: `http://ai-service:8002`) |

### AI Service

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ | OpenAI API key |
| `PINECONE_API_KEY` | ✅ | Pinecone API key |
| `PINECONE_INDEX_NAME` | — | Pinecone index (default: `ai-agent-memory`) |
| `BACKEND_API_URL` | ✅ | Internal backend URL |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Full public API URL (must include `/api`) |

---

## Database

### Migrations

Prisma migrations are **automatically applied** when the backend container starts (via `docker-entrypoint.sh`).

```bash
# Manual migration (inside container)
docker compose exec backend npx prisma migrate deploy

# Create a new migration (development only)
cd backend
npx prisma migrate dev --name your_migration_name

# Open Prisma Studio
docker compose exec backend npx prisma studio
```

### Seed Data

```bash
# Run seed (creates admin user + sample agents)
docker compose exec backend npx prisma db seed
```

Default admin credentials (from seed):
- **Email:** `admin@test.com`
- **Password:** `123456` ← **⚠️ Change immediately in production!**

---

## File Uploads

Uploaded files (user avatars, documents) are stored in:
- **Container path:** `/app/uploads/`
- **Docker volume:** `mindforge_uploads_data` (persisted across restarts)

Accessed via: `http://yourdomain.com/uploads/<filename>`

---

## Common Commands

```bash
# View all container status
docker compose ps

# Restart a single service
docker compose restart backend

# View backend logs
docker compose logs -f backend

# View AI service logs
docker compose logs -f ai-service

# Access backend shell
docker compose exec backend sh

# Access PostgreSQL
docker compose exec db psql -U mindforge -d mindforge_db

# Access Redis CLI
docker compose exec redis redis-cli -a $REDIS_PASSWORD

# Stop everything
docker compose down

# Stop and remove volumes (DESTROYS ALL DATA)
docker compose down -v

# Rebuild a single service
docker compose build backend --no-cache
docker compose up -d backend
```

---

## Production Checklist

Before going live, complete these steps:

### Security
- [ ] Change all default passwords in `.env`
- [ ] Generate strong secrets: `openssl rand -hex 64`
- [ ] Set `CORS` to only allow your frontend URL (see audit report C-04)
- [ ] Restrict internal AI endpoints with a service key (audit C-03)
- [ ] Change admin seed password (audit C-05)
- [ ] Fix default user role from ADMIN to USER (audit H-01)

### SSL / HTTPS
- [ ] Install Certbot: `sudo apt install certbot python3-certbot-nginx`
- [ ] Obtain certificate: `certbot --nginx -d yourdomain.com`
- [ ] Uncomment HTTPS block in `nginx/nginx.conf`
- [ ] Uncomment HTTP→HTTPS redirect in `nginx/nginx.conf`

### Monitoring
- [ ] Set up log aggregation (ELK, Grafana Loki, etc.)
- [ ] Configure alerting on container health checks
- [ ] Set up PostgreSQL backups (e.g., pg_dump cron job)

### Performance
- [ ] Enable Redis password authentication in production
- [ ] Set appropriate rate limits on auth endpoints (audit H-03)
- [ ] Replace 3-second polling with WebSockets for real-time messaging (audit M-06)

---

## Project Structure

```
mindforge-ai-agent-shell-platform/
├── backend/                    # Node.js Express API
│   ├── prisma/                 # Schema, migrations, seed
│   ├── src/
│   │   ├── app/
│   │   │   └── modules/        # Feature modules (auth, users, agents, etc.)
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # HTTP server + graceful shutdown
│   ├── Dockerfile
│   ├── docker-entrypoint.sh    # Wait for DB + run migrations
│   └── .env.example
├── ai-codebase/                # Python FastAPI AI Service
│   ├── app/
│   │   ├── core/               # Logger configuration
│   │   ├── llm/                # OpenAI adapter
│   │   ├── orchestrator/       # Agent runner (identity + RAG + LLM)
│   │   └── services/           # Pinecone, embedding, backend API clients
│   ├── main.py                 # FastAPI entrypoint
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/                   # Next.js Web Application
│   ├── src/
│   │   ├── api/                # Axios client with JWT interceptors
│   │   ├── app/                # Next.js App Router pages
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # React context (Auth)
│   │   └── utils/              # Cookie utilities
│   ├── Dockerfile
│   ├── next.config.mjs         # Standalone output for Docker
│   └── .env.example
├── nginx/
│   └── nginx.conf              # Reverse proxy configuration
├── docker-compose.yml          # Production deployment
├── docker-compose.dev.yml      # Development overlay
├── .dockerignore               # Docker build excludes
├── .env.example                # Complete environment template
└── README.md
```

---

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend Framework | Next.js | 15.x |
| UI Styling | Tailwind CSS | 3.x |
| Backend Framework | Express.js | 4.x |
| Backend Runtime | Node.js | 22.x |
| ORM | Prisma | 6.x |
| Database | PostgreSQL | 16 |
| Cache | Redis | 7 |
| AI Framework | FastAPI | 0.110 |
| AI Runtime | Python | 3.12 |
| LLM | OpenAI gpt-4o-mini | — |
| Embeddings | text-embedding-3-small | — |
| Vector DB | Pinecone | — |
| Proxy | Nginx | 1.27 |
| Containerization | Docker + Compose | 24+ |

---

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture Docs](./docs/architecture.md) | Full service topology and data flows |
| [Audit Report](./docs/audit_report.md) | Production readiness findings |
| [API Reference](./docs/api_reference.md) | Full backend API endpoint reference |
| [.env.example](./.env.example) | Complete environment variable reference |

---

## License

Proprietary. All rights reserved.