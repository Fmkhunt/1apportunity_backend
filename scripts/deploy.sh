#!/bin/bash

# Deployment script for TresureHunt Backend
# This script is called by GitHub Actions

set -e

echo "🚀 Starting TresureHunt Backend deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the correct directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Please run this script from the application directory."
    exit 1
fi

# Login to GitHub Container Registry
print_status "Logging in to GitHub Container Registry..."
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_ACTOR --password-stdin

# Pull latest images
print_status "Pulling latest Docker images..."
docker pull ghcr.io/fmkhunt/1apportunity-backend-user-service:latest
docker pull ghcr.io/fmkhunt/1apportunity-backend-claim-service:latest
docker pull ghcr.io/fmkhunt/1apportunity-backend-hunt-service:latest
docker pull ghcr.io/fmkhunt/1apportunity-backend-wallet-service:latest

# Stop existing containers gracefully
print_status "Stopping existing containers..."
docker-compose down

# Start services with new images
print_status "Starting services with new images..."
docker-compose up -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service status
print_status "Checking service status..."
docker-compose ps

# Check if all services are running
FAILED_SERVICES=$(docker-compose ps --services --filter "status=exited")
if [ ! -z "$FAILED_SERVICES" ]; then
    print_error "Some services failed to start: $FAILED_SERVICES"
    print_error "Service logs:"
    docker-compose logs $FAILED_SERVICES
    exit 1
fi

# Test service endpoints
print_status "Testing service endpoints..."
services=("user-service:3000" "claim-service:3001" "hunt-service:3002" "wallet-service:3003")

for service in "${services[@]}"; do
    service_name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if curl -f -s "http://localhost:$port/health" > /dev/null; then
        print_status "✅ $service_name is healthy"
    else
        print_warning "⚠️  $service_name health check failed"
    fi
done

# Clean up old images
print_status "Cleaning up old Docker images..."
docker image prune -f

# Show final status
print_status "Final deployment status:"
docker-compose ps

echo ""
print_status "🎉 Deployment completed successfully!"
echo ""
echo "📊 Service URLs:"
echo "- User Service: http://localhost:3000"
echo "- Claim Service: http://localhost:3001"
echo "- Hunt Service: http://localhost:3002"
echo "- Wallet Service: http://localhost:3003"
echo ""
echo "🔍 To monitor services:"
echo "- View logs: docker-compose logs -f"
echo "- Check status: docker-compose ps"
echo "- Restart services: docker-compose restart"