# Quick Start Guide - Taiwan Stock Fund Screening System

## 5-Minute Setup

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- Redis 6+

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/yourusername/twstock-screener.git
cd twstock-screener

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend (.env):**
```bash
cd backend
cat > .env << 'EOF'
APP_ENV=development
APP_PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=twstock_db
DB_USER=postgres
DB_PASSWORD=postgres
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://localhost:5173
EOF
```

**Frontend (.env.local):**
```bash
cd ../frontend
cat > .env.local << 'EOF'
VITE_API_URL=http://localhost:3000/api
EOF
```

### 3. Database Setup

```bash
# Create database
createdb -U postgres twstock_db

# Run migrations
cd ../backend
npm run db:migrate

# Optional: Seed sample data
npm run db:seed
```

### 4. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend running on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend running on http://localhost:5173
```

### 5. Access Application

- **Frontend:** http://localhost:5173
- **API:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/api/health

---

## Common Tasks

### Run Tests
```bash
cd backend
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run lint         # Linting
```

### Build for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Docker Setup
```bash
docker-compose up -d
# Automatically starts PostgreSQL, Redis, Backend, Frontend
```

---

## API Quick Reference

### Get Top 30 Stocks
```bash
curl http://localhost:3000/api/stocks/top30
```

### Create Subscription
```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "subscriptionType": "all"
  }'
```

### List Subscriptions
```bash
curl http://localhost:3000/api/subscriptions
```

---

## File Structure Quick Guide

```
twstock-screener/
├── backend/                    # Node.js API
│   ├── src/
│   │   ├── jobs/              # Scheduled tasks (cron)
│   │   ├── modules/           # Feature modules
│   │   └── config/            # Configuration
│   └── package.json
├── frontend/                   # React app
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   └── services/          # API client
│   └── package.json
├── API_DOCUMENTATION.md       # API reference
├── DEPLOYMENT_GUIDE.md        # Production setup
├── PROJECT_OVERVIEW.md        # Architecture
└── docker-compose.yml         # Docker setup
```

---

## Pages & Routes

### Frontend Routes
- `/` - Home (Top 30 stocks)
- `/stock/:symbol` - Stock details
- `/statistics` - Analytics dashboard
- `/subscriptions` - Notification preferences

### API Routes
- `GET /api/stocks/top30` - Top 30 stocks
- `GET /api/stocks/:symbol` - Stock details
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions` - List subscriptions
- `DELETE /api/subscriptions/:id` - Delete subscription

---

## Scheduled Jobs

| Job | Schedule | Function |
|-----|----------|----------|
| Crawler | 8:30, 13:00, 15:00 | Fetch fund net buy data |
| Processor | 16:00 | Process daily data |
| Notification | 16:30 | Send daily summary |
| Alerts | Every 5 min | Check alert rules |

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error
```bash
# Check PostgreSQL
psql -U postgres -d twstock_db

# Check Redis
redis-cli ping
```

### Build Error
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

---

## Environment Variables

### Backend
- `APP_ENV` - development/production
- `APP_PORT` - API port (default: 3000)
- `DB_HOST` - Database host
- `REDIS_HOST` - Redis host
- `CORS_ORIGIN` - Frontend URL

### Frontend
- `VITE_API_URL` - API base URL

See `.env.example` files for complete list.

---

## Next Steps

1. **Development** - Use npm run dev
2. **Testing** - Run npm test
3. **Production** - See DEPLOYMENT_GUIDE.md
4. **API Calls** - See API_DOCUMENTATION.md
5. **Architecture** - See PROJECT_OVERVIEW.md

---

## Support

- **API Docs:** API_DOCUMENTATION.md
- **Deployment:** DEPLOYMENT_GUIDE.md
- **Overview:** PROJECT_OVERVIEW.md
- **Issues:** GitHub Issues
- **Email:** admin@example.com

---

## Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm test               # Run tests
npm run lint           # Check code style
npm run build          # Build for production

# Database
npm run db:migrate     # Run migrations
npm run db:seed        # Seed data
npm run db:backup      # Backup database

# Docker
docker-compose up      # Start all services
docker-compose down    # Stop all services
docker-compose logs    # View logs
```

---

**Ready to start?** Follow the 5-minute setup above!
