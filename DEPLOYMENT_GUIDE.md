# Taiwan Stock Fund Screening System - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Production Deployment](#production-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Prerequisites

### Required Software
- **Node.js** >= 16.x
- **PostgreSQL** >= 12.x
- **Redis** >= 6.x
- **npm** or **yarn** package manager
- **Git** for version control

### Recommended
- **Docker** and **Docker Compose** for containerized deployment
- **PM2** for process management in production
- **Nginx** for reverse proxy

---

## Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/twstock-screener.git
cd twstock-screener
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Environment Configuration

Create `.env` file in `backend/` directory:
```env
# Application
APP_NAME="Taiwan Stock Fund Screening"
APP_VERSION="1.0.0"
APP_ENV="development"
APP_PORT=3000
CORS_ORIGIN="http://localhost:5173"

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=twstock_db
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@twstock-screener.com
NOTIFICATION_EMAIL=admin@example.com

# API Configuration
API_TIMEOUT=30000
MAX_RETRIES=3
CRAWLER_DELAY=100
```

Create `.env.local` in `frontend/` directory:
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Database Setup

**Create database and tables:**
```bash
cd backend
npm run db:migrate
npm run db:seed  # (Optional) Seed initial data
```

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Health Check: http://localhost:3000/api/health

---

## Production Deployment

### 1. Build Artifacts

**Backend:**
```bash
cd backend
npm run build
npm run lint
npm run test
```

**Frontend:**
```bash
cd frontend
npm run build
npm run lint
npm run test
```

### 2. Server Setup

**Ubuntu/Debian Server:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

### 3. Database Setup

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE twstock_db;
CREATE USER twstock_user WITH PASSWORD 'secure_password';
ALTER ROLE twstock_user SET client_encoding TO 'utf8';
ALTER ROLE twstock_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE twstock_user SET default_transaction_deferrable TO on;
ALTER ROLE twstock_user SET default_transaction_read_committed TO on;
GRANT ALL PRIVILEGES ON DATABASE twstock_db TO twstock_user;
\q
```

### 4. Deploy Backend

```bash
# Clone repository
git clone https://github.com/yourusername/twstock-screener.git
cd twstock-screener/backend

# Install dependencies
npm install --production

# Build
npm run build

# Configure environment
cp .env.example .env
# Edit .env with production values
nano .env

# Run migrations
npm run db:migrate

# Start with PM2
pm2 start dist/main.js --name "twstock-backend"
pm2 save
pm2 startup
```

### 5. Deploy Frontend

```bash
# Build frontend
cd ../frontend
npm install --production
npm run build

# Copy to web root
sudo cp -r dist/* /var/www/html/

# Configure Nginx
sudo nano /etc/nginx/sites-available/default
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/html;
    index index.html;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SSL (after setting up with Let's Encrypt)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
}
```

### 6. SSL/TLS Setup

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### 7. Monitoring

```bash
# Monitor PM2 processes
pm2 monitor

# View logs
pm2 logs twstock-backend

# Health check endpoint
curl http://localhost:3000/api/health
```

---

## Docker Deployment

### 1. Build Docker Images

**Dockerfile - Backend:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

**Dockerfile - Frontend:**
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Docker Compose

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: twstock_db
      POSTGRES_USER: twstock_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - DB_HOST=postgres
      - REDIS_HOST=redis
      - APP_ENV=production
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

### 3. Run Docker Compose

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop
docker-compose down
```

---

## Environment Configuration

### Development
```env
APP_ENV=development
DB_HOST=localhost
REDIS_HOST=localhost
CORS_ORIGIN=http://localhost:5173
```

### Staging
```env
APP_ENV=staging
DB_HOST=staging-db.example.com
REDIS_HOST=staging-redis.example.com
CORS_ORIGIN=https://staging.example.com
```

### Production
```env
APP_ENV=production
DB_HOST=prod-db.example.com
REDIS_HOST=prod-redis.example.com
CORS_ORIGIN=https://example.com
```

---

## Database Setup

### Initial Migration
```bash
npm run db:migrate
```

### Seed Sample Data
```bash
npm run db:seed
```

### Backup Database
```bash
pg_dump -U twstock_user twstock_db > backup.sql
```

### Restore Database
```bash
psql -U twstock_user twstock_db < backup.sql
```

---

## Monitoring and Maintenance

### PM2 Monitoring
```bash
# Start monitoring dashboard
pm2 monitor

# Kill all processes
pm2 kill

# Restart all
pm2 restart all

# Graceful reload
pm2 reload all
```

### Log Management
```bash
# View live logs
pm2 logs

# Save logs
pm2 save

# Flush logs
pm2 flush
```

### Health Checks
```bash
# Check API health
curl http://localhost:3000/api/health

# Check database connection
psql -h localhost -U twstock_user -d twstock_db -c "SELECT 1"

# Check Redis connection
redis-cli ping
```

### Performance Optimization

1. **Database Indexing:**
```sql
CREATE INDEX idx_symbol ON fund_net_buy(symbol);
CREATE INDEX idx_date ON fund_net_buy(date);
CREATE INDEX idx_symbol_date ON fund_net_buy(symbol, date);
```

2. **Redis Caching:**
- Cached data expires after configured TTL
- Clear cache when needed: `redis-cli FLUSHDB`

3. **Frontend Optimization:**
- Gzip compression enabled
- Code splitting for faster loads
- Image optimization

---

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

**Database connection error:**
```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Check connection
psql -h localhost -U twstock_user -d twstock_db
```

**Redis connection error:**
```bash
# Check Redis service
sudo systemctl status redis-server

# Test connection
redis-cli ping
```

### Frontend Issues

**Build fails:**
```bash
# Clear cache and node_modules
rm -rf node_modules dist
npm install
npm run build
```

**Port 5173 in use:**
```bash
# Use different port
npm run dev -- --port 5174
```

---

## Security Recommendations

1. **Environment Variables:**
   - Never commit `.env` files
   - Use strong passwords
   - Rotate credentials regularly

2. **Database:**
   - Enable SSL connections
   - Use strong passwords
   - Implement regular backups
   - Restrict IP access

3. **API Security:**
   - Enable HTTPS/TLS
   - Implement rate limiting
   - Add API authentication (JWT)
   - Validate all inputs

4. **Monitoring:**
   - Set up error tracking (Sentry)
   - Monitor system resources
   - Set up alerts for failures
   - Review logs regularly

---

## Support

For issues or questions:
1. Check logs: `pm2 logs`
2. Review API documentation: See `API_DOCUMENTATION.md`
3. Open an issue on GitHub
4. Contact: admin@example.com
