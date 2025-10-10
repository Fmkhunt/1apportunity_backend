#!/bin/bash

# Complete Server Setup Script for TresureHunt Backend
# Run this script on your Ubuntu server to set up everything from scratch

set -e  # Exit on any error

echo "🚀 Starting TresureHunt Backend Server Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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
# sudo apt update
# sudo apt upgrade -y

# # Install essential tools
# print_status "Installing essential tools..."
# sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release htop

# # Install Docker
# print_status "Installing Docker..."
# if ! command -v docker &> /dev/null; then
#     # Add Docker's official GPG key
#     curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
#     # Add Docker repository
#     echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
#     # Update package list
#     sudo apt update
    
#     # Install Docker
#     sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
#     # Add current user to docker group
#     sudo usermod -aG docker $USER
    
#     print_status "Docker installed successfully!"
# else
#     print_status "Docker already installed!"
# fi

# # Install Docker Compose (standalone)
# print_status "Installing Docker Compose..."
# if ! command -v docker-compose &> /dev/null; then
#     sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
#     sudo chmod +x /usr/local/bin/docker-compose
#     print_status "Docker Compose installed successfully!"
# else
#     print_status "Docker Compose already installed!"
# fi

# # Install Node.js
# print_status "Installing Node.js..."
# if ! command -v node &> /dev/null; then
#     curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
#     sudo apt install -y nodejs
#     print_status "Node.js installed successfully!"
# else
#     print_status "Node.js already installed!"
# fi

# # Install PostgreSQL client
# print_status "Installing PostgreSQL client..."
# sudo apt install -y postgresql-client

# # Install Nginx
# print_status "Installing Nginx..."
# sudo apt install -y nginx

# # Install Certbot for SSL
# print_status "Installing Certbot for SSL certificates..."
# sudo apt install -y certbot python3-certbot-nginx

# # Create application directory
# print_status "Creating application directories..."
# sudo mkdir -p /opt/tresurehunt-backend
# sudo chown $USER:$USER /opt/tresurehunt-backend

# sudo mkdir -p /var/log/tresurehunt
# sudo chown $USER:$USER /var/log/tresurehunt

# sudo mkdir -p /opt/backups/tresurehunt
# sudo chown $USER:$USER /opt/backups/tresurehunt

# # Configure firewall
# print_status "Configuring firewall..."
# sudo ufw --force enable
# sudo ufw allow ssh
# sudo ufw allow 80
# sudo ufw allow 443
# sudo ufw allow 3000
# sudo ufw allow 3001
# sudo ufw allow 3002
# sudo ufw allow 3003

# # Create Nginx configuration
# print_status "Creating Nginx configuration..."
# sudo tee /etc/nginx/sites-available/tresurehunt > /dev/null <<EOF
# server {
#     listen 80;
#     server_name _;

#     # User Service
#     location /api/users/ {
#         proxy_pass http://localhost:3000/;
#         proxy_set_header Host \$host;
#         proxy_set_header X-Real-IP \$remote_addr;
#         proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto \$scheme;
#     }

#     # Claim Service
#     location /api/claims/ {
#         proxy_pass http://localhost:3001/;
#         proxy_set_header Host \$host;
#         proxy_set_header X-Real-IP \$remote_addr;
#         proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto \$scheme;
#     }

#     # Hunt Service
#     location /api/hunts/ {
#         proxy_pass http://localhost:3002/;
#         proxy_set_header Host \$host;
#         proxy_set_header X-Real-IP \$remote_addr;
#         proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto \$scheme;
#     }

#     # Wallet Service
#     location /api/wallet/ {
#         proxy_pass http://localhost:3003/;
#         proxy_set_header Host \$host;
#         proxy_set_header X-Real-IP \$remote_addr;
#         proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto \$scheme;
#     }

#     # Health check endpoint
#     location /health {
#         access_log off;
#         return 200 "healthy\n";
#         add_header Content-Type text/plain;
#     }
# }
# EOF

# # Enable Nginx site
# sudo ln -sf /etc/nginx/sites-available/tresurehunt /etc/nginx/sites-enabled/
# sudo rm -f /etc/nginx/sites-enabled/default
# sudo nginx -t
# sudo systemctl restart nginx
# sudo systemctl enable nginx

# # Create environment file template
# print_status "Creating environment file template..."
# cat > /opt/tresurehunt-backend/.env <<EOF
# # Production Environment Variables
# NODE_ENV=production

# # Application Configuration
# APP_NAME=TechMultiverse
# APP_URL=http://your-domain.com
# FRONTEND_URL=https://tressure-hunt-seven.vercel.app/

# # User Service Database Configuration (PostgreSQL - Aiven Cloud)
# USER_DB_HOST=hackathon-user-service-hackathon-user-service.c.aivencloud.com
# USER_DB_PORT=27596
# USER_DB_NAME=oneapportunity
# USER_DB_USER=avnadmin
# USER_DB_PASSWORD=AVNS_BiEkKzkp1tV0gyuYo_P

# # Claim Service Database Configuration (PostgreSQL)
# CLAIM_DATABASE_URL=postgresql://username:password@your-external-db-host:5432/claim_db

# # Hunt Service Database Configuration (PostgreSQL)
# HUNT_DATABASE_URL=postgresql://username:password@your-external-db-host:5432/hunt_db

# # Wallet Service Database Configuration (PostgreSQL)
# WALLET_DATABASE_URI=postgresql://username:password@your-external-db-host:5432/wallet_db

# # JWT Configuration (GENERATE NEW SECURE KEYS!)
# JWT_SECRET=your_super_secure_jwt_secret_key_here_32_chars_minimum
# JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_here_32_chars_minimum
# JWT_EXPIRES_IN=1h
# JWT_REFRESH_EXPIRES_IN=7d

# # Email Configuration
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASS=your_app_password

# # Referral Configuration
# REFERRAL_COIN=200

# # Server Configuration
# SERVER_HOST=0.0.0.0
# EOF

# Create docker-compose.yml template
print_status "Creating docker-compose.yml template..."
cat > /opt/tresurehunt-backend/docker-compose.yml <<EOF
version: '3.8'

services:
  user-service:
    image: ghcr.io/fmkhunt/1apportunity-backend-user-service:latest
    container_name: tresurehunt-user-service
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    networks:
      - tresurehunt-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  claim-service:
    image: ghcr.io/fmkhunt/1apportunity-backend-claim-service:latest
    container_name: tresurehunt-claim-service
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    networks:
      - tresurehunt-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  hunt-service:
    image: ghcr.io/fmkhunt/1apportunity-backend-hunt-service:latest
    container_name: tresurehunt-hunt-service
    restart: unless-stopped
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    networks:
      - tresurehunt-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3002/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  wallet-service:
    image: ghcr.io/fmkhunt/1apportunity-backend-wallet-service:latest
    container_name: tresurehunt-wallet-service
    restart: unless-stopped
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    networks:
      - tresurehunt-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3003/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  tresurehunt-network:
    driver: bridge
EOF

# Create deployment script
print_status "Creating deployment script..."
cat > /opt/tresurehunt-backend/deploy.sh <<'EOF'
#!/bin/bash

# Deployment script for TresureHunt Backend
# This script is called by GitHub Actions

set -e

echo "🚀 Starting deployment..."

# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_ACTOR --password-stdin

# Pull latest images
echo "📥 Pulling latest images..."
docker pull ghcr.io/fmkhunt/1apportunity-backend-user-service:latest
docker pull ghcr.io/fmkhunt/1apportunity-backend-claim-service:latest
docker pull ghcr.io/fmkhunt/1apportunity-backend-hunt-service:latest
docker pull ghcr.io/fmkhunt/1apportunity-backend-wallet-service:latest

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Start services with new images
echo "🚀 Starting services..."
docker-compose up -d

# Clean up old images
echo "🧹 Cleaning up old images..."
docker image prune -f

# Check service status
echo "📊 Service status:"
docker-compose ps

echo "✅ Deployment completed successfully!"
EOF

chmod +x /opt/tresurehunt-backend/deploy.sh

# Create systemd service for auto-start
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/tresurehunt.service > /dev/null <<EOF
[Unit]
Description=TresureHunt Backend Services
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/tresurehunt-backend
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable tresurehunt.service

# Create log rotation configuration
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/tresurehunt > /dev/null <<EOF
/var/log/tresurehunt/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        docker-compose -f /opt/tresurehunt-backend/docker-compose.yml restart
    endscript
}
EOF

# Create monitoring script
print_status "Creating monitoring script..."
cat > /opt/tresurehunt-backend/monitor.sh <<'EOF'
#!/bin/bash

# Monitoring script for TresureHunt Backend

echo "🔍 TresureHunt Backend Status Check"
echo "=================================="

# Check Docker status
echo "📦 Docker Status:"
docker --version
docker-compose --version

# Check service status
echo -e "\n🚀 Service Status:"
cd /opt/tresurehunt-backend
docker-compose ps

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
echo -e "\n📋 Recent Logs (last 10 lines):"
docker-compose logs --tail=10

echo -e "\n✅ Status check completed!"
EOF

chmod +x /opt/tresurehunt-backend/monitor.sh

# Create backup script
print_status "Creating backup script..."
cat > /opt/tresurehunt-backend/backup.sh <<'EOF'
#!/bin/bash

# Backup script for TresureHunt Backend

BACKUP_DIR="/opt/backups/tresurehunt"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="tresurehunt_backup_$DATE.tar.gz"

echo "📦 Creating backup: $BACKUP_FILE"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
cd /opt/tresurehunt-backend
tar -czf "$BACKUP_DIR/$BACKUP_FILE" \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    .

# Keep only last 7 backups
cd $BACKUP_DIR
ls -t tresurehunt_backup_*.tar.gz | tail -n +8 | xargs -r rm

echo "✅ Backup created: $BACKUP_DIR/$BACKUP_FILE"
EOF

chmod +x /opt/tresurehunt-backend/backup.sh

# Set up cron jobs
print_status "Setting up cron jobs..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/tresurehunt-backend/backup.sh") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/tresurehunt-backend/monitor.sh >> /var/log/tresurehunt/monitor.log 2>&1") | crontab -

# Final status check
print_status "Running final status check..."
sudo systemctl status nginx --no-pager -l
sudo ufw status

echo ""
echo "🎉 Server setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit /opt/tresurehunt-backend/.env with your actual database credentials"
echo "2. Clone your repository: cd /opt/tresurehunt-backend && git clone https://github.com/fmkhunt/1apportunity_backend.git ."
echo "3. Set up GitHub secrets for CI/CD deployment"
echo "4. Test the deployment with: docker-compose up -d"
echo ""
echo "🔧 Useful commands:"
echo "- Monitor services: /opt/tresurehunt-backend/monitor.sh"
echo "- View logs: docker-compose logs -f"
echo "- Restart services: docker-compose restart"
echo "- Stop services: docker-compose down"
echo "- Start services: docker-compose up -d"
echo ""
echo "⚠️  Important: Log out and log back in for Docker group changes to take effect!"
echo ""
print_warning "Please log out and log back in to activate Docker group membership."