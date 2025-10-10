#!/bin/bash

# Simple Server Setup Script for TresureHunt Backend (Node.js + PM2 + Nginx)
# Run this script on your Ubuntu server

set -e

echo "🚀 Starting TresureHunt Backend Server Setup..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install essential tools
print_status "Installing essential tools..."
sudo apt install -y curl wget git unzip software-properties-common

# Install Node.js
print_status "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt install -y nodejs
    print_status "Node.js installed successfully!"
else
    print_status "Node.js already installed!"
fi

# Install PM2 globally
print_status "Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_status "PM2 installed successfully!"
else
    print_status "PM2 already installed!"
fi

# Install PostgreSQL client
print_status "Installing PostgreSQL client..."
sudo apt install -y postgresql-client

# Install Nginx
print_status "Installing Nginx..."
sudo apt install -y nginx

# Create application directory
print_status "Creating application directories..."
sudo mkdir -p /opt/tresurehunt-backend
sudo chown $USER:$USER /opt/tresurehunt-backend

sudo mkdir -p /var/log/tresurehunt
sudo chown $USER:$USER /var/log/tresurehunt

# Configure firewall
print_status "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw allow 3001
sudo ufw allow 3002
sudo ufw allow 3003

# Create Nginx configuration
print_status "Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/tresurehunt > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    # User Service
    location /userservice/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Claim Service
    location /claimservice/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Hunt Service
    location /huntservice/ {
        proxy_pass http://localhost:3002/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Wallet Service
    location /walletservice/ {
        proxy_pass http://localhost:3003/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/tresurehunt /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Create environment file templates for each service
print_status "Creating environment file templates for each service..."

# Create service directories
mkdir -p /opt/tresurehunt-backend/user-service
mkdir -p /opt/tresurehunt-backend/claim-service
mkdir -p /opt/tresurehunt-backend/hunt-service
mkdir -p /opt/tresurehunt-backend/wallet-service

# User Service .env
cat > /opt/tresurehunt-backend/user-service/.env <<EOF
# User Service Environment Variables
NODE_ENV=production
PORT=3000
APP_NAME=TresureHunt
APP_URL=http://your-server-ip:3000
FRONTEND_URL=https://tressure-hunt-seven.vercel.app/

# Database Configuration (PostgreSQL - Aiven Cloud)
DB_HOST=hackathon-user-service-hackathon-user-service.c.aivencloud.com
DB_PORT=27596
DB_NAME=oneapportunity
DB_USER=avnadmin
DB_PASSWORD=AVNS_BiEkKzkp1tV0gyuYo_P

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here_32_chars_minimum
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_here_32_chars_minimum
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Referral Configuration
REFERRAL_COIN=200
EOF

# Claim Service .env
cat > /opt/tresurehunt-backend/claim-service/.env <<EOF
# Claim Service Environment Variables
NODE_ENV=production
PORT=3001
APP_NAME=TresureHunt
APP_URL=http://your-server-ip:3001
FRONTEND_URL=https://tressure-hunt-seven.vercel.app/

# Database Configuration
DATABASE_URL=postgresql://username:password@your-external-db-host:5432/claim_db

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here_32_chars_minimum
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_here_32_chars_minimum
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
EOF

# Hunt Service .env
cat > /opt/tresurehunt-backend/hunt-service/.env <<EOF
# Hunt Service Environment Variables
NODE_ENV=production
PORT=3002
APP_NAME=TresureHunt
APP_URL=http://your-server-ip:3002
FRONTEND_URL=https://tressure-hunt-seven.vercel.app/

# Database Configuration
DATABASE_URL=postgresql://username:password@your-external-db-host:5432/hunt_db

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here_32_chars_minimum
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_here_32_chars_minimum
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
EOF

# Wallet Service .env
cat > /opt/tresurehunt-backend/wallet-service/.env <<EOF
# Wallet Service Environment Variables
NODE_ENV=production
PORT=3003
APP_NAME=TresureHunt
APP_URL=http://your-server-ip:3003
FRONTEND_URL=https://tressure-hunt-seven.vercel.app/

# Database Configuration
DATABASE_URL=postgresql://username:password@your-external-db-host:5432/wallet_db

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here_32_chars_minimum
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_here_32_chars_minimum
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
EOF

# Create PM2 ecosystem file
print_status "Creating PM2 ecosystem configuration..."
cat > /opt/tresurehunt-backend/ecosystem.config.js <<EOF
module.exports = {
  apps: [
    {
      name: 'user-service',
      cwd: '/opt/tresurehunt-backend/user-service',
      script: 'dist/app.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/tresurehunt/user-service-error.log',
      out_file: '/var/log/tresurehunt/user-service-out.log',
      log_file: '/var/log/tresurehunt/user-service.log',
      time: true
    },
    {
      name: 'claim-service',
      cwd: '/opt/tresurehunt-backend/claim-service',
      script: 'dist/app.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/tresurehunt/claim-service-error.log',
      out_file: '/var/log/tresurehunt/claim-service-out.log',
      log_file: '/var/log/tresurehunt/claim-service.log',
      time: true
    },
    {
      name: 'hunt-service',
      cwd: '/opt/tresurehunt-backend/hunt-service',
      script: 'dist/app.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: '/var/log/tresurehunt/hunt-service-error.log',
      out_file: '/var/log/tresurehunt/hunt-service-out.log',
      log_file: '/var/log/tresurehunt/hunt-service.log',
      time: true
    },
    {
      name: 'wallet-service',
      cwd: '/opt/tresurehunt-backend/wallet-service',
      script: 'dist/app.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      error_file: '/var/log/tresurehunt/wallet-service-error.log',
      out_file: '/var/log/tresurehunt/wallet-service-out.log',
      log_file: '/var/log/tresurehunt/wallet-service.log',
      time: true
    }
  ]
};
EOF

# Create deployment script
print_status "Creating deployment script..."
cat > /opt/tresurehunt-backend/deploy.sh <<'EOF'
#!/bin/bash

# Simple deployment script for TresureHunt Backend
# This script is called by GitHub Actions

set -e

echo "🚀 Starting TresureHunt Backend deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

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
if [ ! -f "ecosystem.config.js" ]; then
    print_error "ecosystem.config.js not found. Please run this script from the application directory."
    exit 1
fi

# Stop PM2 processes
print_status "Stopping existing PM2 processes..."
pm2 stop all || true
pm2 delete all || true

# Install dependencies for each service (only production dependencies)
print_status "Installing production dependencies..."

services=("user-service" "claim-service" "hunt-service" "wallet-service")

for service in "${services[@]}"; do
    print_status "Installing dependencies for $service..."
    cd $service
    # Only install production dependencies since we already have compiled JS
    npm install --production --omit=dev
    cd ..
done

# Start services with PM2
print_status "Starting services with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup

print_status "Checking service status..."
pm2 status

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

echo ""
print_status "🎉 Deployment completed successfully!"
echo ""
echo "📊 Service URLs:"
echo "- User Service: http://your-server-ip/userservice/"
echo "- Claim Service: http://your-server-ip/claimservice/"
echo "- Hunt Service: http://your-server-ip/huntservice/"
echo "- Wallet Service: http://your-server-ip/walletservice/"
echo ""
echo "🔍 To monitor services:"
echo "- View status: pm2 status"
echo "- View logs: pm2 logs"
echo "- Restart services: pm2 restart all"
echo "- Stop services: pm2 stop all"
EOF

chmod +x /opt/tresurehunt-backend/deploy.sh

# Create monitoring script
print_status "Creating monitoring script..."
cat > /opt/tresurehunt-backend/monitor.sh <<'EOF'
#!/bin/bash

# Monitoring script for TresureHunt Backend

echo "🔍 TresureHunt Backend Status Check"
echo "=================================="

# Check Node.js and PM2 status
echo "📦 Runtime Status:"
node --version
npm --version
pm2 --version

# Check PM2 service status
echo -e "\n🚀 PM2 Service Status:"
pm2 status

# Check system resources
echo -e "\n💻 System Resources:"
echo "Memory Usage:"
free -h
echo -e "\nDisk Usage:"
df -h

# Check Nginx status
echo -e "\n🌐 Nginx Status:"
sudo systemctl status nginx --no-pager -l

# Check firewall status
echo -e "\n🔥 Firewall Status:"
sudo ufw status

# Check recent logs
echo -e "\n📋 Recent PM2 Logs:"
pm2 logs --lines 5

echo -e "\n✅ Status check completed!"
EOF

chmod +x /opt/tresurehunt-backend/monitor.sh

# Final status check
print_status "Running final status check..."
sudo systemctl status nginx --no-pager -l
sudo ufw status

echo ""
echo "🎉 Server setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit service .env files with your actual database credentials:"
echo "   - /opt/tresurehunt-backend/user-service/.env"
echo "   - /opt/tresurehunt-backend/claim-service/.env"
echo "   - /opt/tresurehunt-backend/hunt-service/.env"
echo "   - /opt/tresurehunt-backend/wallet-service/.env"
echo "2. Clone your repository: cd /opt/tresurehunt-backend && git clone https://github.com/fmkhunt/1apportunity_backend.git ."
echo "3. Set up GitHub secrets for CI/CD deployment"
echo "4. Test the deployment with: ./deploy.sh"
echo ""
echo "🔧 Useful commands:"
echo "- Monitor services: ./monitor.sh"
echo "- View PM2 logs: pm2 logs"
echo "- Restart services: pm2 restart all"
echo "- Stop services: pm2 stop all"
echo "- Start services: pm2 start ecosystem.config.js"
echo ""
print_warning "Please log out and log back in to activate all changes."