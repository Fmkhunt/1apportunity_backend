# Complete Server Setup & CI/CD Deployment Guide

This guide will walk you through setting up a fresh Ubuntu server and deploying your microservices using CI/CD.

## 🎯 What We'll Accomplish

1. **Set up Ubuntu server** from scratch
2. **Install Docker & Docker Compose**
3. **Configure GitHub Actions CI/CD**
4. **Deploy microservices** automatically
5. **Set up reverse proxy** with Nginx
6. **Configure SSL** (optional)

## 📋 Prerequisites

- Ubuntu VPS server (20.04+)
- Domain name (optional, for SSL)
- GitHub repository with your code
- SSH access to your server

## 🚀 Step 1: Server Setup

### 1.1 Connect to Your Server

```bash
# Connect via SSH
ssh root@your-server-ip
# or
ssh your-username@your-server-ip
```

### 1.2 Update System

```bash
# Update package list
sudo apt update

# Upgrade existing packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

### 1.3 Install Docker

```bash
# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package list
sudo apt update

# Install Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add your user to docker group (replace 'ubuntu' with your username)
sudo usermod -aG docker ubuntu

# Install Docker Compose (standalone)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 1.4 Install Additional Tools

```bash
# Install Node.js (for potential local development)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL client (for database connections)
sudo apt install -y postgresql-client

# Install Nginx (for reverse proxy)
sudo apt install -y nginx

# Install Certbot (for SSL certificates)
sudo apt install -y certbot python3-certbot-nginx
```

### 1.5 Create Application Directory

```bash
# Create application directory
sudo mkdir -p /opt/tresurehunt-backend
sudo chown $USER:$USER /opt/tresurehunt-backend

# Create log directory
sudo mkdir -p /var/log/tresurehunt
sudo chown $USER:$USER /var/log/tresurehunt

# Create backup directory
sudo mkdir -p /opt/backups/tresurehunt
sudo chown $USER:$USER /opt/backups/tresurehunt
```

### 1.6 Configure Firewall

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow your application ports (optional, for direct access)
sudo ufw allow 3000
sudo ufw allow 3001
sudo ufw allow 3002
sudo ufw allow 3003

# Check firewall status
sudo ufw status
```

## 🔧 Step 2: GitHub Secrets Setup

### 2.1 Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:

- `HOST`: Your server IP address
- `USERNAME`: Your server username (usually `ubuntu` or `root`)
- `SSH_PASSWORD`: Your server SSH password
- `PORT`: SSH port (usually `22`)

### 2.2 Generate SSH Key (Optional but Recommended)

```bash
# On your local machine, generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Add public key to server
ssh-copy-id -i ~/.ssh/id_rsa.pub ubuntu@your-server-ip

# Add private key to GitHub secrets as SSH_KEY (instead of SSH_PASSWORD)
```

## 📁 Step 3: Server Configuration

### 3.1 Clone Repository (One-time setup)

```bash
# Navigate to application directory
cd /opt/tresurehunt-backend

# Clone your repository
git clone https://github.com/fmkhunt/1apportunity_backend.git .

# Verify files are cloned
ls -la
```

### 3.2 Set Up Environment Files

```bash
# Create main environment file
nano .env
```

**Add this content to `.env`:**
```bash
# Production Environment Variables
NODE_ENV=production

# Application Configuration
APP_NAME=TechMultiverse
APP_URL=http://your-domain.com
FRONTEND_URL=https://tressure-hunt-seven.vercel.app/

# User Service Database Configuration (PostgreSQL - Aiven Cloud)
USER_DB_HOST=hackathon-user-service-hackathon-user-service.c.aivencloud.com
USER_DB_PORT=27596
USER_DB_NAME=oneapportunity
USER_DB_USER=avnadmin
USER_DB_PASSWORD=AVNS_BiEkKzkp1tV0gyuYo_P

# Claim Service Database Configuration (PostgreSQL)
CLAIM_DATABASE_URL=postgresql://username:password@your-external-db-host:5432/claim_db

# Hunt Service Database Configuration (PostgreSQL)
HUNT_DATABASE_URL=postgresql://username:password@your-external-db-host:5432/hunt_db

# Wallet Service Database Configuration (PostgreSQL)
WALLET_DATABASE_URI=postgresql://username:password@your-external-db-host:5432/wallet_db

# JWT Configuration (GENERATE NEW SECURE KEYS!)
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

# Server Configuration
SERVER_HOST=0.0.0.0
```

### 3.3 Set Up Docker Compose

```bash
# Copy production docker-compose file
cp docker-compose.production.yml docker-compose.yml

# Edit docker-compose.yml to use your repository name
nano docker-compose.yml
```

**Update the image names in docker-compose.yml:**
```yaml
# Your actual image names:
image: ghcr.io/fmkhunt/1apportunity-backend-user-service:latest
image: ghcr.io/fmkhunt/1apportunity-backend-claim-service:latest
image: ghcr.io/fmkhunt/1apportunity-backend-hunt-service:latest
image: ghcr.io/fmkhunt/1apportunity-backend-wallet-service:latest
```

### 3.4 Set Up Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/tresurehunt
```

**Add this content:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # User Service
    location /api/users/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Claim Service
    location /api/claims/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Hunt Service
    location /api/hunts/ {
        proxy_pass http://localhost:3002/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Wallet Service
    location /api/wallet/ {
        proxy_pass http://localhost:3003/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/tresurehunt /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 3.5 Set Up SSL Certificate (Optional but Recommended)

```bash
# Install SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## 🔄 Step 4: CI/CD Pipeline

### 4.1 How CI/CD Works

1. **You push code** to GitHub (`git push origin main`)
2. **GitHub Actions** automatically triggers
3. **Builds Docker images** for all services
4. **Pushes images** to GitHub Container Registry
5. **SSH to your server** using password authentication
6. **Pulls new images** from registry
7. **Restarts services** with new images

### 4.2 GitHub Actions Workflow

Your `.github/workflows/deploy.yml` file handles:

```yaml
name: Build and Deploy Docker Images

on:
  push:
    branches: [ main, master ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: fmkhunt/1apportunity-backend

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build and push User Service
      uses: docker/build-push-action@v5
      with:
        context: ./user-service
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-user-service:latest

    - name: Build and push Claim Service
      uses: docker/build-push-action@v5
      with:
        context: ./claim-service
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-claim-service:latest

    - name: Build and push Hunt Service
      uses: docker/build-push-action@v5
      with:
        context: ./hunt-service
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-hunt-service:latest

    - name: Build and push Wallet Service
      uses: docker/build-push-action@v5
      with:
        context: ./wallet-service
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-wallet-service:latest

    - name: Deploy to server
      uses: appleboy/ssh-action@v1.0.3
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        password: ${{ secrets.SSH_PASSWORD }}
        port: ${{ secrets.PORT }}
        script: |
          # Login to GitHub Container Registry
          echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          
          # Pull latest images
          docker pull ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-user-service:latest
          docker pull ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-claim-service:latest
          docker pull ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-hunt-service:latest
          docker pull ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-wallet-service:latest
          
          # Stop existing containers
          docker-compose down
          
          # Start services with new images
          docker-compose up -d
          
          # Clean up old images
          docker image prune -f
```

## 🚀 Step 5: Deploy Your Application

### 5.1 First Deployment

```bash
# On your server, manually pull and start services
cd /opt/tresurehunt-backend

# Login to GitHub Container Registry
echo "your_github_token" | docker login ghcr.io -u fmkhunt --password-stdin

# Pull images
docker-compose pull

# Start services
docker-compose up -d

# Check if services are running
docker-compose ps
```

### 5.2 Verify Deployment

```bash
# Check service status
docker-compose ps

# Check logs
docker-compose logs -f

# Test endpoints
curl http://localhost:3000/health  # User Service
curl http://localhost:3001/health  # Claim Service
curl http://localhost:3002/health  # Hunt Service
curl http://localhost:3003/health  # Wallet Service
curl http://localhost/health       # Nginx
```

## 🔄 Step 6: Daily Workflow

### 6.1 Development Workflow

1. **Develop locally** on your machine
2. **Test your changes** locally
3. **Commit and push** to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
4. **GitHub Actions** automatically deploys
5. **Check deployment** on your server

### 6.2 Monitoring

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Restart services if needed
docker-compose restart

# Check system resources
htop
df -h
free -h
```

## 🔍 Troubleshooting

### Common Issues

#### 1. **Services Not Starting**
```bash
# Check logs
docker-compose logs

# Check if images exist
docker images | grep ghcr.io

# Pull images manually
docker-compose pull
docker-compose up -d
```

#### 2. **Database Connection Issues**
```bash
# Test database connection
docker-compose exec user-service psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME

# Check environment variables
docker-compose exec user-service env | grep DB_
```

#### 3. **Nginx Issues**
```bash
# Check Nginx status
sudo systemctl status nginx

# Test Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

#### 4. **CI/CD Pipeline Issues**
- Check GitHub Actions logs
- Verify GitHub secrets are correct
- Ensure server is accessible via SSH
- Check if GitHub Container Registry permissions are correct

## 📊 Service Architecture

```
Internet → Nginx (Port 80/443) → Services (Port 3000-3003) → External Databases
```

### Service Endpoints:
- **User Service**: `http://your-domain.com/api/users/`
- **Claim Service**: `http://your-domain.com/api/claims/`
- **Hunt Service**: `http://your-domain.com/api/hunts/`
- **Wallet Service**: `http://your-domain.com/api/wallet/`

## 🎉 Success!

After following this guide, you'll have:

✅ **Ubuntu server** set up with Docker  
✅ **CI/CD pipeline** automatically deploying code  
✅ **Microservices** running in containers  
✅ **Reverse proxy** routing traffic  
✅ **SSL certificates** (if configured)  
✅ **Monitoring** and logging  
✅ **Automatic deployments** on every push  

## 🔐 Security Checklist

- [ ] Firewall configured
- [ ] SSL certificate installed
- [ ] Strong JWT secrets generated
- [ ] Database passwords secured
- [ ] GitHub secrets configured
- [ ] Regular backups scheduled
- [ ] Monitoring enabled

## 📞 Support

If you encounter issues:
1. Check the logs first: `docker-compose logs`
2. Verify environment variables: `docker-compose config`
3. Test database connections
4. Check firewall settings
5. Review GitHub Actions logs

---

**Remember**: Replace placeholder values (your-domain.com, your-username, etc.) with your actual values throughout this guide.