# Simple Server Deployment Guide

This guide shows how to deploy the TresureHunt Backend microservices using Node.js + PM2 + Nginx (no Docker).

## 🎯 What We'll Accomplish

1. **Set up Ubuntu server** with Node.js, PM2, and Nginx
2. **Configure GitHub Actions CI/CD** for automatic deployment
3. **Deploy microservices** with PM2 process manager
4. **Set up reverse proxy** with Nginx

## 📋 Prerequisites

- Ubuntu VPS server (20.04+)
- GitHub repository with your code
- SSH access to your server
- External database credentials

## 🚀 Step 1: Server Setup

### 1.1 Connect to Your Server

```bash
# Connect via SSH
ssh ubuntu@your-server-ip
```

### 1.2 Run Setup Script

```bash
# Download and run setup script
wget https://raw.githubusercontent.com/fmkhunt/1apportunity_backend/main/scripts/setup-server.sh
chmod +x setup-server.sh
./setup-server.sh

# Log out and back in (important!)
exit
ssh ubuntu@your-server-ip
```

### 1.3 Configure Environment

```bash
# Edit environment files for each service
nano /opt/tresurehunt-backend/user-service/.env
nano /opt/tresurehunt-backend/claim-service/.env
nano /opt/tresurehunt-backend/hunt-service/.env
nano /opt/tresurehunt-backend/wallet-service/.env

# Update with your actual database credentials:
# - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD (for user-service)
# - DATABASE_URL (for other services)
# - JWT_SECRET, JWT_REFRESH_SECRET (generate secure keys!)
```

### 1.4 Clone Repository

```bash
# Clone your repository
cd /opt/tresurehunt-backend
git clone https://github.com/fmkhunt/1apportunity_backend.git .
```

## 🔧 Step 2: GitHub Secrets Setup

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `HOST`: Your server IP address
- `USERNAME`: ubuntu (or your server username)
- `SSH_PASSWORD`: Your server SSH password
- `PORT`: 22

## 🔄 Step 3: CI/CD Workflow

### How It Works:
1. **Push code** → `git push origin main`
2. **GitHub Actions** builds TypeScript to JavaScript
3. **Creates deployment package** with only compiled JS files
4. **SSH to server** and runs deployment script
5. **PM2 restarts** all services with new compiled code

### Manual Deployment:
```bash
# On your server
cd /opt/tresurehunt-backend
./deploy.sh
```

## 🌐 Service Endpoints

After deployment, your services will be available at:

- **User Service**: `http://your-server-ip/userservice/`
- **Claim Service**: `http://your-server-ip/claimservice/`
- **Hunt Service**: `http://your-server-ip/huntservice/`
- **Wallet Service**: `http://your-server-ip/walletservice/`

## 🔍 Monitoring Commands

```bash
# Check service status
pm2 status

# View logs
pm2 logs

# Monitor system
/opt/tresurehunt-backend/monitor.sh

# Restart services
pm2 restart all

# Stop services
pm2 stop all

# Start services
pm2 start ecosystem.config.js
```

## 🛠️ Troubleshooting

### Services Not Starting
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs

# Check if services are built
ls -la user-service/dist/
ls -la claim-service/dist/
ls -la hunt-service/dist/
ls -la wallet-service/dist/
```

### Database Connection Issues
```bash
# Test database connection
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME

# Check environment variables
env | grep DB_
```

### Nginx Issues
```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 📊 Service Architecture

```
Internet → Nginx (Port 80) → PM2 Processes (Port 3000-3003) → External Databases
```

### PM2 Process Management:
- **User Service**: Port 3000
- **Claim Service**: Port 3001
- **Hunt Service**: Port 3002
- **Wallet Service**: Port 3003

## 🔄 Daily Workflow

### Development Workflow

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

## 🎉 Success!

After following this guide, you'll have:

✅ **Ubuntu server** set up with Node.js + PM2 + Nginx  
✅ **CI/CD pipeline** automatically deploying code  
✅ **Microservices** running with PM2  
✅ **Reverse proxy** routing traffic  
✅ **Monitoring** and logging  
✅ **Automatic deployments** on every push  

## 🔐 Security Checklist

- [ ] Firewall configured
- [ ] Strong JWT secrets generated
- [ ] Database passwords secured
- [ ] GitHub secrets configured
- [ ] PM2 processes secured
- [ ] Regular backups scheduled

## 📞 Support

If you encounter issues:
1. Check PM2 status: `pm2 status`
2. Check logs: `pm2 logs`
3. Verify environment variables
4. Test database connections
5. Check firewall settings
6. Review GitHub Actions logs

---

**🚀 You're all set! Your TresureHunt Backend is now running on your server with PM2 and CI/CD pipeline!**