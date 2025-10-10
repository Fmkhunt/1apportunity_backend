# Simple Docker Deployment Guide

## 🎯 What This Does

- **CI/CD Pipeline**: Builds Docker images and pushes them to GitHub Container Registry
- **Server Deployment**: Pulls Docker images and runs them on your server
- **No Git Pull**: Server only needs Docker images, not source code

## 🚀 How It Works

1. **You push code** to GitHub
2. **GitHub Actions** builds Docker images
3. **Images are pushed** to GitHub Container Registry
4. **Server pulls** new images and restarts services

## 📋 Server Setup (One Time)

### 1. Install Docker

```bash
# Connect to your server
ssh root@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again
exit
ssh root@your-server-ip
```

### 2. Create Application Directory

```bash
# Create directory
sudo mkdir -p /opt/tresurehunt-backend
sudo chown $USER:$USER /opt/tresurehunt-backend
cd /opt/tresurehunt-backend
```

### 3. Set Up Environment Files

```bash
# Create main environment file
nano .env
```

**Add this content to `.env`:**
```bash
NODE_ENV=production
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Database URLs
CLAIM_DATABASE_URL=postgresql://username:password@your-db-host:5432/claim_db
HUNT_DATABASE_URL=postgresql://username:password@your-db-host:5432/hunt_db
WALLET_MONGODB_URI=postgresql://username:password@your-db-host:5432/wallet_db
```

### 4. Set Up Docker Compose

```bash
# Copy production docker-compose file
cp docker-compose.production.yml docker-compose.yml

# Edit docker-compose.yml to use your repository name
nano docker-compose.yml
```

**Update the image names in docker-compose.yml:**
```yaml
# Change these lines:
image: ghcr.io/your-username/your-repository-user-service:latest
image: ghcr.io/your-username/your-repository-claim-service:latest
image: ghcr.io/your-username/your-repository-hunt-service:latest
image: ghcr.io/your-username/your-repository-wallet-service:latest

# To your actual repository:
image: ghcr.io/your-actual-username/your-actual-repo-user-service:latest
image: ghcr.io/your-actual-username/your-actual-repo-claim-service:latest
image: ghcr.io/your-actual-username/your-actual-repo-hunt-service:latest
image: ghcr.io/your-actual-username/your-actual-repo-wallet-service:latest
```

### 5. Set Up Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/tresurehunt
```

**Add this content:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location /api/users/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/claims/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/hunts/ {
        proxy_pass http://localhost:3002/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/wallet/ {
        proxy_pass http://localhost:3003/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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

### 6. Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow ssh
sudo ufw enable
```

## 🔧 GitHub Secrets Setup

Add these secrets to your GitHub repository:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:

- `HOST`: Your server IP address
- `USERNAME`: Your server username (usually `root` or `ubuntu`)
- `SSH_PASSWORD`: Your server SSH password
- `PORT`: SSH port (usually `22`)

## 🚀 How to Deploy

### 1. Push Code to GitHub

```bash
# In your local project
git add .
git commit -m "Update code"
git push origin main
```

### 2. GitHub Actions Will:

1. Build Docker images for all services
2. Push images to GitHub Container Registry
3. SSH to your server
4. Pull new images
5. Restart services

### 3. Check Deployment

```bash
# On your server
cd /opt/tresurehunt-backend
docker-compose ps
docker-compose logs -f
```

## 🔍 Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose logs

# Check if images exist
docker images | grep ghcr.io

# Pull images manually
docker-compose pull
docker-compose up -d
```

### Environment Variables Issues

```bash
# Check environment variables
docker-compose config

# Check specific service environment
docker-compose exec user-service env
```

### Database Connection Issues

```bash
# Test database connection
docker-compose exec user-service psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
```

## 📊 Monitoring

### Check Service Status

```bash
# All services
docker-compose ps

# Specific service logs
docker-compose logs -f user-service
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart user-service
```

## 🎉 That's It!

Your application will be available at:
- **Main Application**: `http://your-domain.com`
- **User Service**: `http://your-domain.com/api/users/`
- **Claim Service**: `http://your-domain.com/api/claims/`
- **Hunt Service**: `http://your-domain.com/api/hunts/`
- **Wallet Service**: `http://your-domain.com/api/wallet/`

## 🔄 Daily Workflow

1. **Develop locally**
2. **Push to GitHub** (`git push origin main`)
3. **GitHub Actions** automatically deploys
4. **Check deployment** on your server

No more manual deployment steps!