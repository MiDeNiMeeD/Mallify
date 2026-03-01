# Docker Setup Guide for Mallify Microservices

## Overview
This guide explains how to build and run all Mallify microservices using Docker and Docker Compose.

## Prerequisites
- Docker Desktop installed and running
- Docker Compose v2.0 or higher
- At least 8GB RAM available for Docker
- `.env` file configured (copy from `.env.example`)

## Project Structure
Each microservice has its own Dockerfile:
```
services/
├── docker-compose.yml          # Main orchestration file for all services
├── .dockerignore              # Files to exclude from Docker builds
├── api-gateway/Dockerfile      # Port 4000
├── user-service/Dockerfile     # Port 3001
├── product-service/Dockerfile  # Port 3002
├── boutique-service/Dockerfile # Port 3003
├── order-service/Dockerfile    # Port 3004
├── payment-service/Dockerfile  # Port 3005
├── delivery-service/Dockerfile # Port 3006
├── driver-service/Dockerfile   # Port 3007
├── notification-service/Dockerfile # Port 3008
├── chat-service/Dockerfile     # Port 3009
├── review-service/Dockerfile   # Port 3010
├── promotion-service/Dockerfile # Port 3011
├── wishlist-service/Dockerfile # Port 3012
├── analytics-service/Dockerfile # Port 3013
├── audit-service/Dockerfile    # Port 3014
└── dispute-service/Dockerfile  # Port 3015
```

## Quick Start

### 1. Configure Environment Variables
Make sure you have a `.env` file in the `services/` directory:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 2. Start All Services
```bash
cd services
docker-compose up -d
```

This will:
- Build all microservice Docker images
- Start infrastructure (MongoDB, Redis, RabbitMQ)
- Start all 16 microservices
- Create a shared network for communication

### 3. Check Service Status
```bash
docker-compose ps
```

### 4. View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f user-service
docker-compose logs -f api-gateway
```

## Individual Service Commands

### Build a specific service
```bash
docker-compose build user-service
```

### Start a specific service
```bash
docker-compose up -d user-service
```

### Restart a specific service
```bash
docker-compose restart user-service
```

### Stop a specific service
```bash
docker-compose stop user-service
```

## Infrastructure Services

### MongoDB
- **Port:** 27017
- **Admin UI (Mongo Express):** http://localhost:8081
- **Username:** admin
- **Password:** admin123

### Redis
- **Port:** 6379
- **Password:** mallify_redis_password

### RabbitMQ
- **Port:** 5672 (AMQP)
- **Management UI:** http://localhost:15672
- **Username:** mallify
- **Password:** mallify_password

## Service Ports
| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 4000 | Main entry point |
| User Service | 3001 | Authentication & users |
| Product Service | 3002 | Product catalog |
| Boutique Service | 3003 | Store management |
| Order Service | 3004 | Order processing |
| Payment Service | 3005 | Payment processing |
| Delivery Service | 3006 | Delivery management |
| Driver Service | 3007 | Driver management |
| Notification Service | 3008 | Notifications |
| Chat Service | 3009 | Real-time chat |
| Review Service | 3010 | Reviews & ratings |
| Promotion Service | 3011 | Discounts |
| Wishlist Service | 3012 | User wishlists |
| Analytics Service | 3013 | Analytics |
| Audit Service | 3014 | Audit logs |
| Dispute Service | 3015 | Dispute management |

## Maintenance Commands

### Stop all services
```bash
docker-compose down
```

### Stop all services and remove volumes (⚠️ deletes data)
```bash
docker-compose down -v
```

### Rebuild all services (force clean build)
```bash
docker-compose build --no-cache
```

### Remove unused Docker resources
```bash
docker system prune -a
```

### View resource usage
```bash
docker stats
```

## Troubleshooting

### Service fails to start
1. Check logs: `docker-compose logs service-name`
2. Verify .env configuration
3. Ensure MongoDB and Redis are healthy
4. Check port conflicts: `netstat -ano | findstr :PORT`

### Out of memory
Increase Docker Desktop memory allocation to at least 8GB:
- Docker Desktop → Settings → Resources → Memory

### Network issues
```bash
docker-compose down
docker network prune
docker-compose up -d
```

### Database connection issues
```bash
# Wait for MongoDB to be healthy
docker-compose logs mongodb
```

## Development Workflow

### 1. Make code changes
Edit your service code in `services/service-name/src/`

### 2. Rebuild the service
```bash
docker-compose build service-name
```

### 3. Restart the service
```bash
docker-compose up -d service-name
```

### 4. Watch logs
```bash
docker-compose logs -f service-name
```

## Production Considerations

For production deployment:
1. Use environment-specific .env files
2. Enable health checks for all services
3. Configure resource limits
4. Use secrets management (Docker Secrets, Vault)
5. Set up log aggregation (ELK, Loki)
6. Configure monitoring (Prometheus, Grafana)
7. Use Docker Swarm or Kubernetes for orchestration

## Health Checks
Each service exposes a health endpoint:
```
http://localhost:PORT/health
```

Example:
```bash
curl http://localhost:3001/health  # User Service
curl http://localhost:4000/health  # API Gateway
```

## Scaling Services
```bash
# Scale a service to multiple instances
docker-compose up -d --scale user-service=3
```

## Useful Docker Commands
```bash
# Enter a container shell
docker exec -it mallify-user-service sh

# View container details
docker inspect mallify-user-service

# Copy files from container
docker cp mallify-user-service:/app/logs ./logs

# View real-time container events
docker events
```

## Network Architecture
All services communicate through the `mallify-network` bridge network:
- Services can reach each other using service names
- Example: `mongodb://mongodb:27017` (not localhost)
- External access via exposed ports

## Next Steps
1. ✅ Services running
2. Test API Gateway: `curl http://localhost:4000/health`
3. Access Mongo Express: http://localhost:8081
4. Access RabbitMQ Management: http://localhost:15672
5. Start frontend applications (web/admin, web/manager, etc.)
6. Run database migrations/seeding if needed

## Support
For issues or questions:
- Check service logs: `docker-compose logs -f`
- Review ARCHITECTURE.md for system design
- See individual service README files
