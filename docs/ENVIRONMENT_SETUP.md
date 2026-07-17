# Environment Setup Guide

## Development Environment

### macOS

#### Prerequisites

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node@18
node --version  # v18.x.x
npm --version   # 8.x.x or higher

# Install PostgreSQL
brew install postgresql@13
brew services start postgresql@13

# Install Docker
brew install --cask docker

# Install Git
brew install git
```

#### Setup

```bash
# Clone repository
git clone <repository-url>
cd air

# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Create PostgreSQL database
createdb air_dev
psql air_dev < backend/prisma/seed.sql

# Create environment files
cd backend
cp .env.example .env
# Edit .env with local settings

cd ../frontend
cp .env.example .env
# Edit .env with local API URL
```

### Windows (WSL2 + Docker Desktop)

#### Prerequisites

```powershell
# Install Windows Terminal (recommended)
winget install Microsoft.WindowsTerminal

# Install WSL2
wsl --install

# Install Docker Desktop
# From: https://www.docker.com/products/docker-desktop

# After WSL2 setup, in WSL terminal:
sudo apt-get update
sudo apt-get install nodejs npm postgresql-client
```

#### Setup in WSL2

```bash
# Clone repository
git clone <repository-url>
cd air

# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Start PostgreSQL in Docker
docker run -d \
  --name postgres \
  -e POSTGRES_USER=airuser \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=air_dev \
  -p 5432:5432 \
  postgres:13

# Create environment files
cd backend
cat > .env << EOF
DATABASE_URL="postgresql://airuser:password@localhost:5432/air_dev"
JWT_SECRET="dev-secret-key-change-in-production"
NODE_ENV=development
LOG_LEVEL=debug
EOF

cd ../frontend
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
EOF
```

### Linux (Ubuntu/Debian)

#### Prerequisites

```bash
# Update package manager
sudo apt-get update
sudo apt-get upgrade

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Git
sudo apt-get install -y git
```

#### Setup

```bash
# Clone repository
git clone <repository-url>
cd air

# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Initialize database
sudo systemctl start postgresql
sudo -u postgres createdb air_dev
sudo -u postgres createuser airuser
sudo -u postgres psql -d air_dev < backend/prisma/seed.sql

# Create environment files (same as WSL2 setup)
```

## Docker Development Environment

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Remove volumes (reset database)
docker-compose down -v
```

### Connecting to Services

```bash
# Backend
curl http://localhost:5000/health

# Frontend
open http://localhost:3000

# PostgreSQL
psql -h localhost -U airuser -d air_db
docker-compose exec postgres psql -U airuser -d air_db
```

## IDE Setup

### Visual Studio Code

#### Recommended Extensions

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.makefile-tools",
    "orta.vscode-jest",
    "eamodio.gitlens",
    "ms-azuretools.vscode-docker",
    "ms-mssql.mssql",
    "bradlc.vscode-tailwindcss"
  ]
}
```

#### Settings (.vscode/settings.json)

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/.next": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true
  }
}
```

#### Launch Configuration (.vscode/launch.json)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Backend Debug",
      "program": "${workspaceFolder}/backend/src/server.ts",
      "preLaunchTask": "tsc: build",
      "sourceMaps": true,
      "console": "integratedTerminal"
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Frontend Debug",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/frontend/src"
    }
  ]
}
```

### JetBrains WebStorm

1. Open project in WebStorm
2. Configure Node interpreter:
   - Settings → Languages & Frameworks → Node.js
   - Set to your Node.js installation

3. Enable TypeScript support:
   - Settings → Languages & Frameworks → TypeScript
   - Select TypeScript version from node_modules

4. Setup run configurations:
   - Backend: `npm run dev` in backend directory
   - Frontend: `npm run dev` in frontend directory

## Database Setup

### Local PostgreSQL

```bash
# Create user
createuser airuser

# Create database
createdb -O airuser air_dev

# Connect and setup
psql -U airuser air_dev

# Run migrations
npm run migrate:dev

# Seed data
npm run seed
```

### Docker PostgreSQL

```bash
# Start container
docker run -d \
  --name air-postgres \
  -e POSTGRES_USER=airuser \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=air_db \
  -p 5432:5432 \
  -v air-data:/var/lib/postgresql/data \
  postgres:13

# Verify
psql -h localhost -U airuser -d air_db
```

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL="postgresql://airuser:password@localhost:5432/air_dev"

# JWT
JWT_SECRET="development-secret-key"
JWT_EXPIRES_IN="7d"

# Server
NODE_ENV=development
PORT=5000
LOG_LEVEL=debug

# CORS
CORS_ORIGIN="http://localhost:3000"

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AWS (optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# NetCDF
NETCDF_DATA_PATH="./backend/data/netcdf"
```

### Frontend (.env)

```bash
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_MAPS=true
VITE_ENABLE_REPORTING=true

# Theme
VITE_THEME_MODE=light
```

## Development Workflows

### Running Services

#### Terminal 1: Backend
```bash
cd backend
npm run dev
```

#### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

#### Terminal 3: Database (if not using Docker)
```bash
# Already running as service
psql -U airuser -d air_db
```

#### Terminal 4: Tests (optional)
```bash
cd backend
npm run test:watch
```

### Running Migrations

```bash
cd backend

# Create migration
npm run migrate:create -- --name add_field

# Apply migrations
npm run migrate:dev

# Reset database
npm run migrate:reset
```

### Building

```bash
# Backend
cd backend
npm run build
npm run start

# Frontend
cd frontend
npm run build
npm run preview
```

## Troubleshooting

### Node/NPM Issues

```bash
# Clear npm cache
npm cache clean --force

# Reinstall node_modules
rm -rf node_modules package-lock.json
npm install

# Verify Node version
node --version  # Should be 18.x
```

### Database Connection Issues

```bash
# Test connection
psql postgresql://airuser:password@localhost:5432/air_db

# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list              # macOS

# View connection logs
docker-compose logs postgres
```

### Port Already in Use

```bash
# Find process using port
lsof -i :5000      # Backend
lsof -i :3000      # Frontend
lsof -i :5432      # Database

# Kill process
kill -9 <PID>
```

### TypeScript Errors

```bash
# Regenerate Prisma client
npx prisma generate

# Check for type errors
npx tsc --noEmit

# Update schema
npm run migrate:dev
```

## Performance Tips

### Local Development

```bash
# Use --max-old-space-size for large projects
export NODE_OPTIONS="--max-old-space-size=2048"

# Enable source maps for debugging
"sourceMap": true  # in tsconfig.json
```

### Database Queries

```bash
# Enable query logging
DATABASE_LOGGING="query"

# Analyze slow queries
npm run db:analyze
```

## Additional Resources

- TypeScript: https://www.typescriptlang.org/docs/
- React: https://react.dev/
- Node.js: https://nodejs.org/en/docs/
- PostgreSQL: https://www.postgresql.org/docs/
- Prisma: https://www.prisma.io/docs/
- Docker: https://docs.docker.com/
