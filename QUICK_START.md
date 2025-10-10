# 🚀 Quick Start Guide - TresureHunt Backend Deployment

## 📋 Prerequisites Checklist

- [ ] Ubuntu VPS server (20.04+)
- [ ] Domain name (optional)
- [ ] GitHub repository access
- [ ] SSH access to server
- [ ] External database credentials

## ⚡ Quick Setup (5 minutes)

### 1. Server Setup
```bash
# Connect to your server
ssh ubuntu@your-server-ip

# Download and run setup script
wget https://raw.githubusercontent.com/fmkhunt/1apportunity_backend/main/scripts/setup-server.sh
chmod +x setup-server.sh
./setup-server.sh

# Log out and back in (important!)
exit
ssh ubuntu@your-server-ip
```

### 2. Configure Environment
```bash
# Edit environment file
nano /opt/tresurehunt-backend/.env

# Update with your actual database credentials:
# - USER_DB_HOST, USER_DB_PORT, USER_DB_NAME, USER_DB_USER, USER_DB_PASSWORD
# - CLAIM_DATABASE_URL
# - HUNT_DATABASE_URL  
# - WALLET_DATABASE_URI
# - JWT_SECRET, JWT_REFRESH_SECRET (generate secure keys!)
```

### 3. GitHub Secrets Setup
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `HOST`: Your server IP address
- `USERNAME`: ubuntu (or your server username)
- `SSH_PASSWORD`: Your server SSH password
- `PORT`: 22

### 4. Deploy Application
```bash
# Clone repository
cd /opt/tresurehunt-backend
git clone https://github.com/fmkhunt/1apportunity_backend.git .

# Test deployment
docker-compose up -d

# Check status
docker-compose ps
```

## 🔄 CI/CD Workflow

### How It Works:
1. **Push code** → `git push origin main`
2. **GitHub Actions** builds Docker images
3. **Images pushed** to GitHub Container Registry
4. **Server pulls** new images automatically
5. **Services restart** with new code

### Manual Deployment:
```bash
# On your server
cd /opt/tresurehunt-backend
./deploy.sh
```

## 🌐 Service Endpoints

After deployment, your services will be available at:

- **User Service**: `http://your-domain.com/api/users/`
- **Claim Service**: `http://your-domain.com/api/claims/`
- **Hunt Service**: `http://your-domain.com/api/hunts/`
- **Wallet Service**: `http://your-domain.com/api/wallet/`

## 🔍 Monitoring Commands

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Monitor system
/opt/tresurehunt-backend/monitor.sh

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Start services
docker-compose up -d
```

## 🛠️ Troubleshooting

### Services Not Starting
```bash
# Check logs
docker-compose logs

# Check environment
docker-compose config

# Pull images manually
docker-compose pull
docker-compose up -d
```

### Database Connection Issues
```bash
# Test database connection
docker-compose exec user-service psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME

# Check environment variables
docker-compose exec user-service env | grep DB_
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

## 🔐 Security Checklist

- [ ] Firewall configured (`sudo ufw status`)
- [ ] SSL certificate installed (if using domain)
- [ ] Strong JWT secrets generated
- [ ] Database passwords secured
- [ ] GitHub secrets configured
- [ ] Regular backups scheduled

## 📞 Support

If you encounter issues:

1. **Check logs first**: `docker-compose logs`
2. **Verify environment**: `docker-compose config`
3. **Test database connections**
4. **Check firewall settings**: `sudo ufw status`
5. **Review GitHub Actions logs**

## 🎯 Next Steps

1. **Test all API endpoints**
2. **Set up SSL certificate** (if using domain)
3. **Configure monitoring alerts**
4. **Set up automated backups**
5. **Performance optimization**

---

**🚀 You're all set! Your TresureHunt Backend is now running on your server with CI/CD pipeline!**