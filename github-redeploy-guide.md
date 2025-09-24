# GitHub Repository Replacement and EC2 Redeployment Guide

## Overview
This guide will help you replace your current project in your GitHub repository and redeploy it to your existing EC2 instance while maintaining the connection to your RDS database.

## Prerequisites
- Your current project files (this directory)
- Access to your GitHub repository
- SSH access to your EC2 instance
- Your RDS database credentials and endpoint

## Step 1: Backup Current Configuration

### 1.1 Backup Database Configuration
Your current RDS configuration is in `backend/src/main/resources/application-prod.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sunyield?allowPublicKeyRetrieval=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=password
```

**⚠️ IMPORTANT**: You'll need to update this with your actual RDS endpoint and credentials.

### 1.2 Backup Current Deployment
Before replacing, backup your current deployment:
```bash
# On your EC2 instance
sudo systemctl stop sunyield-backend
sudo systemctl stop nginx
sudo cp -r /opt/sunyield /opt/sunyield-backup
sudo cp -r /var/www/sunyield /var/www/sunyield-backup
```

## Step 2: Update Configuration Files

### 2.1 Update Database Configuration
Update `backend/src/main/resources/application-prod.properties` with your actual RDS details:
```properties
# Replace with your actual RDS endpoint
spring.datasource.url=jdbc:mysql://YOUR_RDS_ENDPOINT:3306/sunyield?allowPublicKeyRetrieval=true&useSSL=false
spring.datasource.username=YOUR_RDS_USERNAME
spring.datasource.password=YOUR_RDS_PASSWORD
```

### 2.2 Update Frontend API Configuration
Update `frontend/src/services/api.ts` with your backend URL:
```typescript
const API_BASE_URL = 'https://YOUR_BACKEND_DOMAIN_OR_IP:8080';
```

### 2.3 Update Deployment Scripts
Update the deployment scripts with your actual domain names and IP addresses.

## Step 3: Push to GitHub

### 3.1 Initialize Git Repository (if not already done)
```bash
git init
git add .
git commit -m "Initial commit - SunYield project"
```

### 3.2 Add GitHub Remote
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### 3.3 Force Push to Replace Repository
```bash
git branch -M main
git push -f origin main
```

## Step 4: Deploy to EC2

### 4.1 Connect to EC2 Instance
```bash
ssh -i your-key.pem ec2-user@YOUR_EC2_IP
```

### 4.2 Clone Updated Repository
```bash
cd /home/ec2-user
rm -rf sunyield-backend  # Remove old files
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git sunyield-backend
cd sunyield-backend
```

### 4.3 Deploy Backend
```bash
chmod +x deploy-backend.sh
./deploy-backend.sh
```

### 4.4 Deploy Frontend
```bash
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

## Step 5: Verify Deployment

### 5.1 Check Backend Status
```bash
sudo systemctl status sunyield-backend
sudo journalctl -u sunyield-backend -f
```

### 5.2 Check Frontend Status
```bash
sudo systemctl status nginx
sudo nginx -t
```

### 5.3 Test Database Connection
```bash
# Test if backend can connect to RDS
curl http://localhost:8080/actuator/health
```

## Step 6: Update DNS and SSL (if applicable)

If you have a domain name:
1. Update DNS records to point to your EC2 instance
2. Configure SSL certificates using Let's Encrypt or AWS Certificate Manager
3. Update nginx configuration to use HTTPS

## Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Verify RDS endpoint and credentials
   - Check security group allows EC2 to connect to RDS
   - Ensure RDS is publicly accessible or in same VPC

2. **Backend Won't Start**
   - Check logs: `sudo journalctl -u sunyield-backend -f`
   - Verify Java and Maven installation
   - Check port 8080 is not in use

3. **Frontend Not Loading**
   - Check nginx status: `sudo systemctl status nginx`
   - Verify nginx configuration: `sudo nginx -t`
   - Check firewall rules allow HTTP/HTTPS traffic

4. **CORS Issues**
   - Update CORS configuration in backend
   - Ensure frontend API URL matches backend URL

## Security Considerations

1. **Environment Variables**: Store sensitive data in environment variables
2. **Security Groups**: Configure AWS security groups properly
3. **SSL/TLS**: Use HTTPS in production
4. **Database**: Use strong passwords and limit access
5. **Logs**: Monitor application logs for security issues

## Monitoring and Maintenance

1. **Set up CloudWatch** for monitoring
2. **Configure log rotation** for application logs
3. **Set up automated backups** for database
4. **Monitor disk space** and performance
5. **Keep system packages updated**

## Rollback Plan

If deployment fails:
```bash
# Stop new services
sudo systemctl stop sunyield-backend
sudo systemctl stop nginx

# Restore from backup
sudo cp -r /opt/sunyield-backup /opt/sunyield
sudo cp -r /var/www/sunyield-backup /var/www/sunyield

# Restart services
sudo systemctl start sunyield-backend
sudo systemctl start nginx
```

## Next Steps

1. Set up CI/CD pipeline for automated deployments
2. Configure monitoring and alerting
3. Set up automated backups
4. Implement proper logging and error tracking
5. Consider using AWS services like ALB, RDS Proxy, etc.
