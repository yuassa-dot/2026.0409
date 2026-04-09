# Taiwan Stock Fund Net Buy Screening

A full-stack web application for daily screening and analysis of top 30 stocks with the highest fund net buying activity in the Taiwan stock market.

## Features

- **Daily Data Scraping**: Automatically scrapes fund net buy data from financial websites (Liancang)
- **Data Analysis**: Processes and ranks stocks by net buying amount
- **Web Dashboard**: Real-time display of top 30 stocks
- **Data Export**: Export data to CSV format
- **Email Notifications**: Send daily email alerts with top performers
- **Database Storage**: PostgreSQL database for historical data tracking
- **Scheduled Tasks**: Automatic daily scraping at configured times

## Tech Stack

### Backend
- **Framework**: Node.js + Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL + Redis
- **Task Scheduling**: node-cron
- **Notifications**: Nodemailer
- **Web Scraping**: Cheerio + Axios

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **State Management**: Zustand

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Environment**: Node.js 18

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── crawler/          # Data scraping logic
│   │   │   ├── processor/        # Data processing
│   │   │   ├── storage/          # Database operations
│   │   │   ├── notification/     # Email/message notifications
│   │   │   └── stocks/           # API endpoints
│   │   ├── jobs/                 # Scheduled tasks
│   │   ├── common/               # Utilities and constants
│   │   └── main.ts               # Application entry point
│   ├── migrations/               # Database schemas
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/                # Page components
│   │   ├── services/             # API services
│   │   ├── hooks/                # Custom React hooks
│   │   └── App.tsx               # Root component
│   └── package.json
├── data/
│   ├── csv/                      # CSV export directory
│   ├── backups/                  # Database backups
│   └── exports/                  # Other exports
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- npm or yarn

### With Docker (Recommended)

1. Clone the repository
```bash
git clone https://github.com/yourusername/taiwan-stock-fund-screening.git
cd taiwan-stock-fund-screening
```

2. Copy environment file
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start services
```bash
npm run docker:up
```

4. Initialize database (first time only)
```bash
npm run db:migrate
```

5. Access the application
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000/api
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Local Development

1. Install dependencies
```bash
npm install
npm run build:backend
npm run build:frontend
```

2. Set up PostgreSQL and Redis
```bash
# Install PostgreSQL and Redis locally or use Docker
docker run -d --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15
docker run -d --name redis -p 6379:6379 redis:7
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Run migrations
```bash
npm run db:migrate
```

5. Start development servers
```bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:frontend
```

## Available Scripts

### Root Level
- `npm run dev` - Start both backend and frontend in development mode
- `npm run build` - Build both backend and frontend
- `npm run test` - Run all tests
- `npm run lint` - Run linting on all packages
- `npm run docker:build` - Build Docker images
- `npm run docker:up` - Start all Docker services
- `npm run docker:down` - Stop all Docker services

### Backend
- `npm run dev:backend` - Start backend development server
- `npm run build:backend` - Build backend for production
- `npm run test:backend` - Run backend tests
- `npm run lint:backend` - Lint backend code
- `npm run db:migrate` - Run database migrations

### Frontend
- `npm run dev:frontend` - Start frontend development server
- `npm run build:frontend` - Build frontend for production
- `npm run test:frontend` - Run frontend tests
- `npm run lint:frontend` - Lint frontend code

## API Endpoints

### Stocks
- `GET /api/stocks/top-30` - Get top 30 stocks
- `GET /api/stocks/:symbol` - Get stock details
- `GET /api/stocks/history` - Get historical data
- `GET /api/statistics` - Get statistics

### Exports
- `GET /api/export/csv` - Export data to CSV

### Health
- `GET /api/health` - Health check

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=twstock_user
DB_PASSWORD=twstock_password
DB_NAME=twstock_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Telegram (optional)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

## Data Flow

```
┌─────────────────┐
│  Scheduled Job  │
│  (08:30, 13:00, │
│    15:00)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Crawler Module │
│  (Scrape data)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Processor      │
│  (Clean, rank)  │
└────────┬────────┘
         │
         ▼
┌────────┴────────┐
│                 │
▼                 ▼
Database        CSV File
│                 │
└────────┬────────┘
         │
         ▼
┌──────────────────┐
│  Frontend API    │
│  (Display data)  │
└──────────────────┘
         │
         ▼
┌──────────────────┐
│  Notifications   │
│  (Email, etc)    │
└──────────────────┘
```

## Testing

```bash
# Run all tests
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Run tests in watch mode
npm run test:watch
```

## Deployment

### Docker Deployment

1. Build production image
```bash
docker-compose build
```

2. Start production services
```bash
docker-compose up -d
```

3. View logs
```bash
docker-compose logs -f
```

### Production Considerations

- Use environment variables for sensitive data
- Set `NODE_ENV=production`
- Configure proper email/notification credentials
- Set up SSL/TLS certificate
- Use proper backup strategy for PostgreSQL
- Monitor application health and logs
- Set up log rotation

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running and accessible
- Check database credentials in `.env`
- Verify network connectivity

### Data Not Scraping
- Check crawler service logs
- Verify target website is accessible
- Review User-Agent rotation settings
- Check network restrictions/proxies

### Email Not Sending
- Verify SMTP credentials
- Check firewall rules for SMTP port
- Review email logs for errors

## Contributing

1. Create a feature branch
2. Make your changes
3. Commit with clear messages
4. Push and create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please create an issue on GitHub.

## Roadmap

- [ ] User authentication and authorization
- [ ] Advanced filtering and search
- [ ] Historical trend analysis
- [ ] Machine learning predictions
- [ ] Mobile app
- [ ] Multiple data sources support
- [ ] WebSocket real-time updates
- [ ] Advanced caching strategies

---

**Last Updated**: 2024-04-09
