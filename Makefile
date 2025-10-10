# Apportunity Backend Makefile

.PHONY: help install build test lint dev docker-up docker-down docker-build docker-logs docker-restart clean

# Default target
help:
	@echo "Apportunity Backend - Available commands:"
	@echo ""
	@echo "Development:"
	@echo "  install     - Install dependencies for all services"
	@echo "  build       - Build all services"
	@echo "  test        - Run tests for all services"
	@echo "  lint        - Run linting for all services"
	@echo "  dev         - Start all services in development mode"
	@echo ""
	@echo "Docker:"
	@echo "  docker-up   - Start all services with Docker Compose"
	@echo "  docker-down - Stop all services"
	@echo "  docker-build- Build all Docker images"
	@echo "  docker-logs - Show logs for all services"
	@echo "  docker-restart - Restart all services"
	@echo ""
	@echo "Utilities:"
	@echo "  clean       - Clean Docker system"
	@echo "  help        - Show this help message"

# Development commands
install:
	npm run install:all

build:
	npm run build:all

test:
	npm run test:all

lint:
	npm run lint:all

dev:
	npm run dev:all

# Docker commands
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-build:
	docker-compose build

docker-logs:
	docker-compose logs -f

docker-restart:
	docker-compose restart

# Deployment is handled by GitHub Actions
# Just push to main branch: git push origin main

# Utility commands
clean:
	docker system prune -f

# Individual service commands
user-install:
	cd user-service && npm install

user-build:
	cd user-service && npm run build

user-test:
	cd user-service && npm test

user-dev:
	cd user-service && npm run dev

claim-install:
	cd claim-service && npm install

claim-build:
	cd claim-service && npm run build

claim-test:
	cd claim-service && npm test

claim-dev:
	cd claim-service && npm run dev

hunt-install:
	cd hunt-service && npm install

hunt-build:
	cd hunt-service && npm run build

hunt-test:
	cd hunt-service && npm test

hunt-dev:
	cd hunt-service && npm run dev

wallet-install:
	cd wallet-service && npm install

wallet-build:
	cd wallet-service && npm run build

wallet-test:
	cd wallet-service && npm test

wallet-dev:
	cd wallet-service && npm run dev