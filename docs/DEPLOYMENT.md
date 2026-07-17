# Deployment Guide: Kenya Aviation Weather Decision Support System

## Overview

This guide covers deploying the Kenya Aviation Weather Decision Support System (KAW-DSS) to production environments using Docker, Docker Compose, and cloud platforms.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for local development)
- PostgreSQL 13+ (if not using Docker)
- Git

## Quick Start: Local Docker Deployment

### 1. Environment Setup

Create a `.env` file in the project root:

```bash
# Backend
BACKEND_PORT=5000
DATABASE_URL=postgresql://user:password@postgres:5432/air_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=production
LOG_LEVEL=info

# Frontend
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000

# Database
POSTGRES_USER=airuser
POSTGRES_PASSWORD=secure-password-here
POSTGRES_DB=air_db
```

### 2. Build and Start Services

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

Services will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api-docs
- **Database**: localhost:5432

### 3. Database Initialization

```bash
# Run migrations
docker-compose exec backend npm run migrate

# Seed initial data
docker-compose exec backend npm run seed
```

## Production Deployment

### AWS Deployment (ECS + RDS)

#### 1. Prepare AWS Resources

```bash
# Create RDS PostgreSQL database
aws rds create-db-instance \
  --db-instance-identifier air-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username airuser \
  --master-user-password "$(openssl rand -base64 32)" \
  --allocated-storage 20

# Get RDS endpoint
aws rds describe-db-instances \
  --db-instance-identifier air-db \
  --query 'DBInstances[0].Endpoint.Address'
```

#### 2. Create ECR Repositories

```bash
# Backend repository
aws ecr create-repository --repository-name air-backend --region us-east-1

# Frontend repository
aws ecr create-repository --repository-name air-frontend --region us-east-1

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com
```

#### 3. Build and Push Images

```bash
# Build backend image
docker build -t air-backend:latest ./backend
docker tag air-backend:latest [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/air-backend:latest
docker push [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/air-backend:latest

# Build frontend image
docker build -t air-frontend:latest ./frontend
docker tag air-frontend:latest [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/air-frontend:latest
docker push [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/air-frontend:latest
```

#### 4. Create ECS Task Definition

Create `task-definition.json`:

```json
{
  "family": "air-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "air-backend",
      "image": "[ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/air-backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql://airuser:password@air-db.c9akciq32.us-east-1.rds.amazonaws.com:5432/air_db"
        },
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/air-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register and deploy:

```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create ECS service
aws ecs create-service \
  --cluster air-production \
  --service-name air-backend-service \
  --task-definition air-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE
```

### Google Cloud Deployment (Cloud Run + Cloud SQL)

#### 1. Create Cloud SQL Instance

```bash
gcloud sql instances create air-db \
  --database-version=POSTGRES_13 \
  --tier=db-f1-micro \
  --region=us-central1
```

#### 2. Create Cloud SQL Database and User

```bash
gcloud sql databases create air_db --instance=air-db

gcloud sql users create airuser \
  --instance=air-db \
  --password="$(openssl rand -base64 32)"
```

#### 3. Build and Deploy Backend

```bash
# Build and push to Cloud Build
gcloud builds submit ./backend \
  --config=backend/cloudbuild.yaml

# Deploy to Cloud Run
gcloud run deploy air-backend \
  --image gcr.io/PROJECT_ID/air-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL="postgresql://airuser:password@air-db/air_db"
```

Create `backend/cloudbuild.yaml`:

```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/air-backend:latest', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/air-backend:latest']
  - name: 'gcr.io/cloud-builders/gke-deploy'
    args: ['run', '--filename=k8s/', '--image=gcr.io/$PROJECT_ID/air-backend:latest', '--location=us-central1']
images:
  - 'gcr.io/$PROJECT_ID/air-backend:latest'
```

### Kubernetes Deployment (Helm)

Create `helm/values.yaml`:

```yaml
backend:
  image: air-backend:latest
  replicas: 3
  resources:
    requests:
      cpu: 256m
      memory: 512Mi
    limits:
      cpu: 512m
      memory: 1Gi

frontend:
  image: air-frontend:latest
  replicas: 2
  resources:
    requests:
      cpu: 100m
      memory: 256Mi
    limits:
      cpu: 256m
      memory: 512Mi

database:
  host: postgresql.default.svc.cluster.local
  port: 5432
  username: airuser
  database: air_db
```

Deploy:

```bash
# Install Helm chart
helm install air ./helm -f helm/values.yaml

# Check deployment status
kubectl get pods -l app=air

# View logs
kubectl logs -l app=air-backend -f
```

## Health Checks and Monitoring

### Readiness Probe

```bash
curl http://localhost:5000/health/ready
```

Response:
```json
{
  "status": "ready",
  "timestamp": "2026-07-16T13:03:26.000Z"
}
```

### Liveness Probe

```bash
curl http://localhost:5000/health/live
```

### Metrics Endpoint

```bash
curl http://localhost:5000/metrics
```

## Backup and Recovery

### Database Backup

```bash
# Local backup
docker-compose exec postgres pg_dump -U airuser air_db > backup.sql

# AWS RDS backup
aws rds create-db-snapshot \
  --db-instance-identifier air-db \
  --db-snapshot-identifier air-db-$(date +%Y%m%d)
```

### Restore from Backup

```bash
# Local restore
cat backup.sql | docker-compose exec -T postgres psql -U airuser air_db

# AWS RDS restore
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier air-db-restored \
  --db-snapshot-identifier air-db-20260716
```

## Troubleshooting

### Backend Connection Issues

```bash
# Check database connectivity
docker-compose exec backend npm run db:check

# Verify environment variables
docker-compose exec backend env | grep DATABASE_URL
```

### Frontend Build Issues

```bash
# Clear cache and rebuild
docker-compose build --no-cache frontend

# Verify API connectivity
docker-compose exec frontend curl http://backend:5000/health
```

### Database Migration Issues

```bash
# Reset migrations (development only)
docker-compose exec backend npm run migrate:reset

# View migration status
docker-compose exec backend npm run migrate:status
```

## Security Considerations

1. **Environment Variables**: Never commit secrets to version control; use CI/CD secret management
2. **HTTPS/TLS**: Enable in production; use nginx or cloud load balancers
3. **Authentication**: Rotate JWT secrets regularly
4. **Database**: Use encrypted connections; enable RDS encryption at rest
5. **Network**: Restrict ingress to necessary ports; use security groups/firewall rules
6. **Monitoring**: Set up CloudWatch/Stackdriver alerts for resource usage and errors

## Performance Tuning

### Database Connection Pool

```env
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

### Node.js Memory

```dockerfile
ENV NODE_OPTIONS="--max-old-space-size=512"
```

### Nginx Cache Headers

```nginx
location /api {
  proxy_cache_valid 200 1h;
  proxy_cache_bypass $http_pragma $http_authorization;
}
```

## Support

For deployment issues, check:
- Docker Compose logs: `docker-compose logs -f`
- Application logs: `/var/log/air/` (or CloudWatch/Stackdriver)
- API documentation: http://localhost:5000/api-docs
