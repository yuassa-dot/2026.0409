# Taiwan Stock Fund Screening System - Project Overview

## Project Description

Taiwan Stock Fund Screening System is a comprehensive web application for tracking and analyzing Taiwan Stock Exchange (TWSE) fund net buy data. The system automatically crawls daily fund net buy information, processes it with advanced analytics, and provides real-time notifications to subscribers.

**Key Features:**
- Automated daily fund net buy data crawling
- Advanced statistical analysis and rankings
- Real-time alerts and notifications
- User subscription management
- Interactive charts and analytics dashboard
- Email notifications
- RESTful API

---

## Project Architecture

```
twstock-screener/
├── backend/                          # Node.js + Express backend
│   ├── src/
│   │   ├── main.ts                  # Application entry point
│   │   ├── app.ts                   # Express app configuration
│   │   ├── jobs/                    # Scheduled jobs (cron)
│   │   │   ├── crawler.job.ts       # Data crawling jobs (8:30, 13:00, 15:00)
│   │   │   ├── processor.job.ts     # Data processing job (16:00)
│   │   │   └── notification.job.ts  # Notification jobs (16:30, every 5min)
│   │   ├── modules/                 # Feature modules
│   │   │   ├── crawler/             # Web scraping functionality
│   │   │   │   └── services/
│   │   │   │       ├── crawler.service.ts
│   │   │   │       ├── parser.service.ts
│   │   │   │       └── stock-price.service.ts
│   │   │   ├── processor/           # Data processing
│   │   │   │   └── services/
│   │   │   │       ├── data-processor.service.ts
│   │   │   │       ├── statistics.service.ts
│   │   │   │       └── ranking.service.ts
│   │   │   ├── notification/        # Email & alerts
│   │   │   │   └── services/
│   │   │   │       ├── email.service.ts
│   │   │   │       └── alert.service.ts
│   │   │   ├── stocks/              # Stock data endpoints
│   │   │   │   ├── stocks.controller.ts
│   │   │   │   └── stocks.routes.ts
│   │   │   ├── subscriptions/       # User subscriptions
│   │   │   │   ├── subscriptions.controller.ts
│   │   │   │   ├── subscriptions.routes.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── subscriptions.service.ts
│   │   │   │   └── repositories/
│   │   │   │       └── subscriptions.repository.ts
│   │   │   └── storage/             # Data persistence
│   │   │       ├── repositories/
│   │   │       └── services/
│   │   ├── config/                  # Configuration files
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   └── env.ts
│   │   ├── common/                  # Shared utilities
│   │   │   ├── types/
│   │   │   ├── constants/
│   │   │   └── utils/
│   │   └── migrations/              # Database migrations
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── Dockerfile
│
├── frontend/                         # React + TypeScript frontend
│   ├── src/
│   │   ├── main.tsx                 # App entry point
│   │   ├── App.tsx                  # Main app component
│   │   ├── pages/                   # Page components
│   │   │   ├── Home.tsx             # Dashboard with top 30 stocks
│   │   │   ├── StockDetail.tsx      # Individual stock details
│   │   │   ├── Statistics.tsx       # Analysis & charts (NEW)
│   │   │   └── Subscriptions.tsx    # Subscription management (NEW)
│   │   ├── components/              # Reusable components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── TopStocksTable.tsx
│   │   │   └── Charts.tsx           # Recharts visualizations (NEW)
│   │   ├── services/                # API client
│   │   │   └── api.ts
│   │   ├── types/                   # TypeScript types
│   │   │   └── stock.ts
│   │   └── styles/                  # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── API_DOCUMENTATION.md             # API endpoints documentation
├── DEPLOYMENT_GUIDE.md              # Production deployment guide
├── PROJECT_OVERVIEW.md              # This file
└── docker-compose.yml               # Docker compose configuration

```

---

## Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL 12+
- **Cache:** Redis 6+
- **Task Scheduler:** node-cron
- **Email:** Nodemailer
- **Web Scraping:** Cheerio, Axios
- **Testing:** Jest
- **Logging:** Winston

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Routing:** React Router
- **Charts:** Recharts
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Testing:** Vitest

### Infrastructure
- **Containerization:** Docker, Docker Compose
- **Process Manager:** PM2 (production)
- **Web Server:** Nginx (production)
- **Version Control:** Git

---

## Database Schema

### Key Tables

#### stocks
```sql
CREATE TABLE stocks (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  market_cap BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### fund_net_buy
```sql
CREATE TABLE fund_net_buy (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  stock_id INT REFERENCES stocks(id),
  symbol VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  buy_amount BIGINT NOT NULL,
  buy_shares BIGINT NOT NULL,
  sell_amount BIGINT,
  sell_shares BIGINT,
  net_buy_amount BIGINT,
  close_price DECIMAL(10,2),
  open_price DECIMAL(10,2),
  high_price DECIMAL(10,2),
  low_price DECIMAL(10,2),
  change_percent DECIMAL(6,2),
  change_amount DECIMAL(10,2),
  rank INT,
  volume BIGINT,
  turnover DECIMAL(8,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### user_subscriptions
```sql
CREATE TABLE user_subscriptions (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  symbol VARCHAR(10),
  subscription_type VARCHAR(20) NOT NULL,
  threshold_change DECIMAL(6,2),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Scheduled Jobs

### 1. Crawler Job (Runs 3x daily on weekdays)
- **Schedule:** 8:30 AM, 1:00 PM, 3:00 PM
- **Function:** Crawls fund net buy data from TWSE website
- **Process:**
  1. Fetch latest fund net buy data
  2. Parse and validate data
  3. Save to PostgreSQL database
  4. Handle errors and retries

### 2. Processor Job (Runs daily at 4:00 PM)
- **Schedule:** 4:00 PM (after market close)
- **Function:** Analyzes daily data
- **Process:**
  1. Retrieve latest 30 stocks
  2. Enhance with historical comparisons
  3. Calculate metrics and rankings
  4. Generate statistics
  5. Cache results in Redis

### 3. Notification Job (Runs continuously)
- **Daily Summary:** 4:30 PM
  - Generates and sends daily summary emails
- **Real-time Alerts:** Every 5 minutes
  - Checks alert rules for threshold violations
  - Sends immediate notifications

---

## API Endpoints Summary

### Stocks Module
- `GET /api/health` - Health check
- `GET /api/stocks/top30` - Get top 30 stocks
- `GET /api/stocks/:symbol` - Get stock details
- `GET /api/stocks/:symbol/history` - Get stock history

### Subscriptions Module
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions` - List all subscriptions
- `GET /api/subscriptions/:id` - Get subscription
- `GET /api/subscriptions/email/:email` - Get by email
- `GET /api/subscriptions/symbol/:symbol` - Get by symbol
- `GET /api/subscriptions/active` - Get active subscriptions
- `PUT /api/subscriptions/:id` - Update subscription
- `PATCH /api/subscriptions/:id/enable` - Enable subscription
- `PATCH /api/subscriptions/:id/disable` - Disable subscription
- `DELETE /api/subscriptions/:id` - Delete subscription

---

## Key Features Implemented

### Phase 1 (MVP) - Completed
- [x] Basic backend infrastructure
- [x] Frontend setup with React
- [x] Web crawler for TWSE data
- [x] Database schema
- [x] API endpoints for stocks

### Phase 2 - Completed
- [x] Scheduled jobs (cron)
- [x] Data processing service
- [x] Statistics calculation
- [x] Ranking algorithms
- [x] Email notifications
- [x] Alert rules system
- [x] Frontend Charts component
- [x] Statistics page
- [x] Enhanced UI

### Phase 3 - Completed
- [x] User subscription system
- [x] Subscription management API
- [x] Subscription management UI
- [x] Redis caching strategy
- [x] Database query optimization

### Phase 4 - Completed
- [x] Unit tests for core services
- [x] API documentation
- [x] Deployment guide
- [x] Docker setup
- [x] Project overview documentation

---

## Environment Variables

### Backend (.env)
```
APP_NAME=Taiwan Stock Fund Screening
APP_VERSION=1.0.0
APP_ENV=development
APP_PORT=3000
CORS_ORIGIN=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_NAME=twstock_db
DB_USER=postgres
DB_PASSWORD=password

REDIS_HOST=localhost
REDIS_PORT=6379

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=app_password
NOTIFICATION_EMAIL=admin@example.com
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:3000/api
```

---

## Running the Application

### Development Mode

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Production Mode

**Using Docker Compose:**
```bash
docker-compose up -d
```

**Manual Deployment:**
```bash
# Backend
cd backend
npm install --production
npm run build
npm start

# Frontend
cd frontend
npm install --production
npm run build
# Serve with Nginx or similar
```

---

## Testing

### Backend Tests
```bash
cd backend
npm test                    # Run all tests
npm run test:watch        # Watch mode
npm run lint              # Linting
npm run type-check        # Type checking
```

### Frontend Tests
```bash
cd frontend
npm test                    # Run tests
npm run test:ui           # UI testing
npm run lint              # Linting
npm run type-check        # Type checking
```

---

## Performance Metrics

### Target Performance
- API Response Time: < 200ms (p95)
- Crawler Execution: < 5 minutes
- Data Processing: < 10 minutes
- Database Queries: < 100ms (p95)

### Optimizations Implemented
- Redis caching for frequently accessed data
- Database indexing on key columns
- Connection pooling for database
- Gzip compression for API responses
- Frontend code splitting
- Image optimization

---

## Monitoring and Logging

### Backend Logging
- Winston logger with multiple transports
- Daily rotation of log files
- Structured JSON logging
- Error tracking and reporting

### Health Checks
- API health endpoint: `GET /api/health`
- Database connectivity monitoring
- Redis connection monitoring
- Job execution tracking

---

## Security Features

### Implemented
- CORS configuration
- Helmet security headers
- Input validation
- SQL injection prevention (parameterized queries)
- XSS protection

### Recommended (Production)
- HTTPS/TLS encryption
- API authentication (JWT)
- Rate limiting
- DDoS protection
- Firewall rules

---

## Future Enhancements

1. **Authentication & Authorization**
   - User login system
   - Role-based access control
   - API key management

2. **Advanced Features**
   - Technical analysis indicators
   - Prediction algorithms
   - Portfolio management
   - Trading signals

3. **Integrations**
   - Telegram bot notifications
   - SMS alerts
   - WeChat notifications
   - Third-party API integrations

4. **Performance**
   - GraphQL API
   - WebSocket real-time updates
   - Advanced caching strategies
   - Database sharding

5. **Analytics**
   - User behavior tracking
   - Performance dashboards
   - Custom reports

---

## Project Statistics

### Code Metrics
- **Backend Lines of Code:** ~2,500+
- **Frontend Lines of Code:** ~1,800+
- **Test Coverage:** 60%+
- **Documentation:** Complete API + Deployment guides

### Dependencies
- **Backend:** 20+ production packages
- **Frontend:** 15+ production packages
- **Development:** 30+ dev packages

---

## Contributing Guidelines

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Ensure linting passes
6. Submit a pull request

---

## License

This project is licensed under the MIT License - see LICENSE file for details.

---

## Support & Contact

- **GitHub Issues:** Report bugs and feature requests
- **Email:** admin@example.com
- **Documentation:** See API_DOCUMENTATION.md and DEPLOYMENT_GUIDE.md

---

## Version History

### v1.0.0 (2024-01-01)
- Initial release
- All core features implemented
- Production-ready deployment

---

## Acknowledgments

- Taiwan Stock Exchange (TWSE) for data
- Open source community for libraries and tools
- Contributors and testers

---

**Last Updated:** 2024-01-01
**Status:** Active Development & Maintenance
