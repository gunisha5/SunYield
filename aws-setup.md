# 🚀 AWS EC2 Deployment Guide for SunYield

## 📋 **Step-by-Step Deployment Process**

### **🔧 Step 1: AWS Infrastructure Setup**

#### **1.1 Create EC2 Instances**
```bash
# Launch Backend EC2 Instance
- Instance Type: t3.medium (2 vCPU, 4 GB RAM)
- AMI: Amazon Linux 2
- Storage: 20 GB GP3
- Security Group: Backend-SG
- Key Pair: Your SSH key

# Launch Frontend EC2 Instance  
- Instance Type: t3.small (2 vCPU, 2 GB RAM)
- AMI: Amazon Linux 2
- Storage: 10 GB GP3
- Security Group: Frontend-SG
- Key Pair: Your SSH key
```

#### **1.2 Configure Security Groups**

**Backend Security Group (Backend-SG):**
```
Inbound Rules:
- SSH (22): 0.0.0.0/0
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
- Custom TCP (8080): 0.0.0.0/0
```

**Frontend Security Group (Frontend-SG):**
```
Inbound Rules:
- SSH (22): 0.0.0.0/0
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
```

#### **1.3 Create RDS Database**
```bash
# MySQL RDS Instance
- Engine: MySQL 8.0
- Instance: db.t3.micro
- Storage: 20 GB
- Multi-AZ: No (for cost savings)
- Security Group: RDS-SG
- Database Name: sunyield
```

**RDS Security Group (RDS-SG):**
```
Inbound Rules:
- MySQL (3306): Backend-SG
```

#### **1.4 Setup AWS SES (Email Service)**
```bash
# Configure SES
- Region: us-east-1
- Verify your domain
- Create SMTP credentials
- Update application-prod.properties
```

### **🔧 Step 2: Backend Deployment**

#### **2.1 Connect to Backend EC2**
```bash
ssh -i your-key.pem ec2-user@your-backend-ip
```

#### **2.2 Upload and Deploy**
```bash
# Upload files (using scp or git)
scp -i your-key.pem -r backend/ ec2-user@your-backend-ip:~/
scp -i your-key.pem deploy-backend.sh ec2-user@your-backend-ip:~/

# SSH into instance and run deployment
ssh -i your-key.pem ec2-user@your-backend-ip
chmod +x deploy-backend.sh
./deploy-backend.sh
```

#### **2.3 Update Configuration**
```bash
# Edit production properties
sudo nano /opt/sunyield/src/main/resources/application-prod.properties

# Update with your actual values:
- RDS endpoint
- Database credentials
- SES credentials
- Frontend domain
```

#### **2.4 Restart Service**
```bash
sudo systemctl restart sunyield-backend
sudo systemctl status sunyield-backend
```

### **🔧 Step 3: Frontend Deployment**

#### **3.1 Connect to Frontend EC2**
```bash
ssh -i your-key.pem ec2-user@your-frontend-ip
```

#### **3.2 Upload and Deploy**
```bash
# Upload files
scp -i your-key.pem -r frontend/ ec2-user@your-frontend-ip:~/
scp -i your-key.pem deploy-frontend.sh ec2-user@your-frontend-ip:~/

# SSH into instance and run deployment
ssh -i your-key.pem ec2-user@your-frontend-ip
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

#### **3.3 Update Configuration**
```bash
# Edit nginx configuration
sudo nano /etc/nginx/conf.d/sunyield.conf

# Update with your actual values:
- Domain name
- Backend API URL
```

#### **3.4 Restart Nginx**
```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

### **🔧 Step 4: Domain and SSL Setup**

#### **4.1 Route 53 (Optional)**
```bash
# Create hosted zone
# Add A records pointing to your EC2 instances
# Update nginx configuration with domain names
```

#### **4.2 SSL Certificate (Let's Encrypt)**
```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **🔧 Step 5: Monitoring and Logs**

#### **5.1 Check Application Logs**
```bash
# Backend logs
sudo journalctl -u sunyield-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs
tail -f /var/log/sunyield/application.log
```

#### **5.2 Health Checks**
```bash
# Backend health check
curl http://your-backend-ip:8080/actuator/health

# Frontend health check
curl http://your-frontend-ip
```

### **🔧 Step 6: Database Setup**

#### **6.1 Initialize Database**
```bash
# Connect to RDS
mysql -h your-rds-endpoint -u your-username -p

# Run initialization scripts
source init_system_config.sql
source create_admin_user.sql
```

### **🔧 Step 7: Environment Variables**

#### **7.1 Backend Environment**
```bash
# Create environment file
sudo nano /opt/sunyield/.env

# Add sensitive data
DB_PASSWORD=your_actual_password
SES_PASSWORD=your_ses_password
JWT_SECRET=your_jwt_secret
```

#### **7.2 Frontend Environment**
```bash
# Create .env file
nano /var/www/sunyield/.env

# Add
REACT_APP_API_URL=https://your-backend-domain.com
```

## 🚨 **Important Security Considerations**

### **1. Firewall Configuration**
```bash
# Only open necessary ports
# Use security groups effectively
# Consider using AWS WAF
```

### **2. Database Security**
```bash
# Use strong passwords
# Enable encryption at rest
# Regular backups
# Monitor access logs
```

### **3. Application Security**
```bash
# Use HTTPS everywhere
# Implement rate limiting
# Regular security updates
# Monitor application logs
```

## 📊 **Cost Optimization**

### **1. Instance Sizing**
```bash
# Start with smaller instances
# Monitor usage with CloudWatch
# Scale up/down based on demand
```

### **2. Reserved Instances**
```bash
# Consider reserved instances for predictable workloads
# Use spot instances for non-critical workloads
```

### **3. Storage Optimization**
```bash
# Use GP3 instead of GP2
# Enable compression
# Regular cleanup of logs
```

## 🔄 **Deployment Automation**

### **1. CI/CD Pipeline (Optional)**
```bash
# Use GitHub Actions or AWS CodePipeline
# Automate testing and deployment
# Implement blue-green deployment
```

### **2. Backup Strategy**
```bash
# Automated database backups
# Application configuration backups
# Disaster recovery plan
```

## 📞 **Support and Monitoring**

### **1. CloudWatch Setup**
```bash
# Enable detailed monitoring
# Set up alarms for CPU, memory, disk
# Monitor application metrics
```

### **2. Log Management**
```bash
# Centralized logging with CloudWatch Logs
# Log retention policies
# Error alerting
```

---

## ✅ **Deployment Checklist**

- [ ] EC2 instances created and configured
- [ ] Security groups properly configured
- [ ] RDS database created and accessible
- [ ] Backend deployed and running
- [ ] Frontend deployed and running
- [ ] Domain configured (if applicable)
- [ ] SSL certificates installed
- [ ] Database initialized with data
- [ ] Email service configured
- [ ] Monitoring and logging set up
- [ ] Security measures implemented
- [ ] Backup strategy in place

---

**🎉 Your SunYield application is now deployed on AWS!** 