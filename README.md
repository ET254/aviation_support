# Kenya Aviation Weather Decision Support System (KAW-DSS)

> A production-grade decision support platform for aviation operations in Kenya, providing real-time weather analysis, operational decision guidance, and impact assessment for pilots, ATC, dispatch, airport operations, and meteorologists.

## 🎯 Overview

The Kenya Aviation Weather Decision Support System delivers critical weather intelligence and aviation decision support to Kenya's aviation community. It integrates real-time weather data from multiple sources (METAR, TAF, SIGMET, NetCDF forecasts) with a sophisticated decision engine to provide actionable guidance for operational stakeholders.

### Key Features

- **Real-time Weather Analysis**: METAR, TAF, SIGMET, and NetCDF forecast ingestion
- **Operational Decision Engine**: Aviation-specific scoring for GO/GO_WITH_CAUTION/HOLD/DIVERT/CANCEL decisions
- **Risk Assessment**: Visibility, wind, crosswind, cloud base, and density altitude scoring
- **Operational Impact Assessment**: Tailored recommendations for pilots, ATC, dispatch, airport operations, maintenance, and meteorologists
- **Alert Management**: Real-time weather alerts and threshold-based notifications
- **Dashboard**: Unified operational dashboard with weather, forecast, and decision data
- **API-First Architecture**: Comprehensive REST API with Swagger documentation
- **Enterprise Deployment**: Support for Docker, Kubernetes, AWS ECS, Google Cloud Run
- **Role-Based Access Control**: Multi-role support (PILOT, ATC, DISPATCHER, METEOROLOGIST, MAINTENANCE, ADMIN)
- **Audit Logging**: Complete audit trail of all operational decisions and changes

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines, development workflow, code style |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment guides (Docker, AWS ECS, GCP Cloud Run, Kubernetes) |
| [docs/OPERATIONS.md](docs/OPERATIONS.md) | Operational procedures, monitoring, incident response, scaling |
| [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md) | Local development environment setup for macOS, Windows, Linux |
| [docs/API_REFERENCE.md](docs/API_REFERENCE.md) | Complete API endpoint documentation with examples |
| [docs/architecture.md](docs/architecture.md) | System architecture and design decisions |
| [docs/netcdf-workflow.md](docs/netcdf-workflow.md) | NetCDF forecast file processing workflow |

## 🏗️ Architecture

### Technology Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Node.js 18+, TypeScript, Express, Prisma, PostgreSQL |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Query |
| **Database** | PostgreSQL 13+ with encrypted backups |
| **DevOps** | Docker, Docker Compose, Kubernetes |
| **Testing** | Jest, React Testing Library, Supertest |
| **Documentation** | Swagger/OpenAPI, Markdown |

## 🚀 Quick Start

### Prerequisites

- Docker Desktop
- Node.js 18+
- Git
- PostgreSQL 13+ (optional, included in Docker)

### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
git clone <repository-url>
cd air

# Build and start services
docker-compose up -d

# Initialize database
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed

# Access services
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# API Docs: http://localhost:5000/api-docs
```

### Option 2: Local Development

See [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md) for detailed local setup instructions.

```bash
# Clone and install
git clone <repository-url>
cd air
npm install

# Backend setup
cd backend
cp .env.example .env
npm install
npm run migrate:dev
npm run seed
npm run dev

# Frontend setup (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev

# Access
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

## 📡 API Usage

### Authentication

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Response includes JWT token
# Use in Authorization header: Authorization: Bearer <token>
```

### Evaluate Weather Conditions

```bash
# Get operational decision for a station
curl -X POST http://localhost:5000/api/decision-support/evaluate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "stationId": "station-1",
    "observation": {
      "temperature": 22,
      "windSpeed": 15,
      "visibility": 10000,
      "cloudBase": 2500
    }
  }'

# Response includes decision (GO/HOLD/etc), risk score, recommendations
```

### Get Dashboard Data

```bash
# Get complete operational dashboard
curl http://localhost:5000/api/decision-support/dashboard/station-1 \
  -H "Authorization: Bearer <token>"
```

See [docs/API_REFERENCE.md](docs/API_REFERENCE.md) for comprehensive API documentation.

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report

# Frontend tests
cd frontend
npm test                    # Jest tests
npm run test:coverage       # Coverage report
```

## 📦 Building

```bash
# Backend
cd backend
npm run build              # Compile TypeScript
npm run start              # Run compiled code

# Frontend
cd frontend
npm run build              # Build for production
npm run preview            # Preview production build
```

## 🔧 Configuration

### Environment Variables

#### Backend (`backend/.env`)

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/air_db
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=production
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (`frontend/.env`)

```bash
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
VITE_THEME_MODE=light
```

See [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md) for full configuration options.

## 🌐 Deployment

### Development

```bash
docker-compose up
```

### Production

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed production deployment guides:
- Docker Compose deployment
- AWS ECS deployment
- Google Cloud Run deployment
- Kubernetes deployment with Helm

Quick example with AWS:

```bash
# Build and push Docker images
docker build -t air-backend:latest ./backend
aws ecr get-login-password | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
docker tag air-backend:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/air-backend:latest
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/air-backend:latest
```

## 📊 Monitoring

### Health Checks

```bash
# Liveness probe
curl http://localhost:5000/health/live

# Readiness probe
curl http://localhost:5000/health/ready
```

### Logs

```bash
# Docker Compose
docker-compose logs -f backend
docker-compose logs -f frontend

# Kubernetes
kubectl logs -f -l app=air-backend
```

See [docs/OPERATIONS.md](docs/OPERATIONS.md) for monitoring dashboards, alerts, and incident response procedures.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development setup
- Code style guidelines
- Commit conventions
- Pull request process
- Testing requirements

## 📋 Project Structure

```
air/
├── backend/                     # Express backend API
│   ├── src/
│   │   ├── adapters/           # Weather data adapters
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Express middleware
│   │   ├── models/             # Data models
│   │   ├── parsers/            # Weather parsers
│   │   ├── services/           # Business logic
│   │   ├── routes/             # API routes
│   │   └── utils/              # Helpers
│   ├── prisma/                 # Database schema
│   ├── tests/                  # Test suites
│   └── package.json
│
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API clients
│   │   ├── stores/             # Zustand stores
│   │   ├── types/              # TypeScript types
│   │   └── App.tsx
│   └── package.json
│
├── docs/                        # Documentation
│   ├── DEPLOYMENT.md
│   ├── OPERATIONS.md
│   ├── ENVIRONMENT_SETUP.md
│   ├── API_REFERENCE.md
│   ├── architecture.md
│   └── netcdf-workflow.md
│
├── docker-compose.yml          # Docker Compose config
├── README.md                    # This file
└── CONTRIBUTING.md             # Contribution guidelines
```

## 🔐 Security

- **Authentication**: JWT-based with role-based access control
- **Database**: PostgreSQL with encrypted connections
- **API**: CORS enabled, rate limiting, input validation
- **Secrets**: Use environment variables, never commit secrets
- **Auditing**: Complete audit trail of all operations

See [docs/OPERATIONS.md](docs/OPERATIONS.md) for security considerations and best practices.

## 📈 Performance

- Response time target: <500ms
- Database query target: <100ms
- Error rate target: <0.1%

See [docs/OPERATIONS.md](docs/OPERATIONS.md) for performance tuning and scaling guidance.

## 🆘 Troubleshooting

### Backend Connection Issues

```bash
# Check database connectivity
docker-compose exec backend npm run db:check

# View logs
docker-compose logs backend
```

### Frontend Build Issues

```bash
# Clear cache and rebuild
cd frontend
rm -rf node_modules dist
npm install
npm run build
```

### Database Issues

```bash
# Reset database (development only)
docker-compose down -v
docker-compose up

# Check database health
docker-compose exec postgres psql -U airuser -d air_db -c "SELECT version();"
```

See [docs/OPERATIONS.md](docs/OPERATIONS.md) for comprehensive troubleshooting guide.

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: See [docs/](docs/)
- **API Docs**: http://localhost:5000/api-docs
- **Community**: Contact team or use discussion forums

## 📜 License

This project is proprietary software for Kenya's aviation authorities. All rights reserved.

## 🙏 Acknowledgments

- Kenya Meteorological Department
- Kenya Airports Authority
- Kenya Civil Aviation Authority
- Aviation stakeholders and weather experts who provided operational guidance

---

**Last Updated**: 2026-07-16
**Version**: 1.0.0
**Status**: Production Ready ✅
