# 🚀 Single EC2 Instance Deployment Guide

## 📋 **Quick Deployment (Recommended)**

### **Step 1: Create EC2 Instance**
```bash
# Launch EC2 Instance
- Instance Type: t3.medium (2 vCPU, 4 GB RAM)
- AMI: Amazon Linux 2
- Storage: 30 GB GP3
- Security Group: SolarCapital-SG
- Key Pair: Your SSH key
```

### **Step 2: Configure Security Group**
```
Inbound Rules:
- SSH (22): 0.0.0.0/0
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
```

### **Step 3: Create RDS Database**
```bash
# MySQL RDS Instance
- Engine: MySQL 8.0
- Instance: db.t3.micro
- Storage: 20 GB
- Security Group: RDS-SG (allow MySQL from EC2-SG)
- Database Name: solarcapital
```

### **Step 4: Deploy Application**
```bash
# Connect to EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Upload files
scp -i your-key.pem -r backend/ ec2-user@your-ec2-ip:~/
scp -i your-key.pem -r frontend/ ec2-user@your-ec2-ip:~/
scp -i your-key.pem deploy-combined.sh ec2-user@your-ec2-ip:~/

# Run deployment
chmod +x deploy-combined.sh
./deploy-combined.sh
```

### **Step 5: Configure Application**
```bash
# Edit production configuration
sudo nano /opt/solarcapital/backend/src/main/resources/application-prod.properties

# Update with your values:
spring.datasource.url=jdbc:mysql://your-rds-endpoint:3306/solarcapital
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### **Step 6: Restart Services**
```bash
# Restart backend
sudo systemctl restart solarcapital-backend

# Restart nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status solarcapital-backend
sudo systemctl status nginx
```

## 🎯 **Architecture Overview**

```
┌─────────────────────────────────────┐
│           Single EC2 Instance       │
│  ┌─────────────────────────────────┐ │
│  │         Nginx (Port 80)         │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │    Frontend (React)         │ │ │
│  │  │    - Static files           │ │ │
│  │  │    - Served by nginx        │ │ │
│  │  └─────────────────────────────┘ │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │    Backend (Spring Boot)    │ │ │
│  │  │    - Port 8080              │ │ │
│  │  │    - Proxied by nginx       │ │ │
│  │  └─────────────────────────────┘ │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│           RDS Database              │
│         (Separate Instance)         │
└─────────────────────────────────────┘
```

## 💰 **Cost Breakdown (Monthly)**

- **EC2 t3.medium:** ~$30
- **RDS db.t3.micro:** ~$15
- **Data Transfer:** ~$5
- **Total:** ~$50/month

## 🔧 **Service Management**

### **Check Application Status**
```bash
# Backend status
sudo systemctl status solarcapital-backend

# Nginx status
sudo systemctl status nginx

# View logs
sudo journalctl -u solarcapital-backend -f
sudo tail -f /var/log/nginx/access.log
```

### **Restart Services**
```bash
# Restart backend
sudo systemctl restart solarcapital-backend

# Restart nginx
sudo systemctl restart nginx
```

### **Update Application**
```bash
# Stop services
sudo systemctl stop solarcapital-backend

# Update code
cd /opt/solarcapital/backend
git pull  # or copy new files

# Rebuild and restart
mvn clean package -DskipTests
sudo systemctl start solarcapital-backend
```

## 🌐 **Access Points**

- **Frontend:** `http://your-ec2-ip`
- **Backend API:** `http://your-ec2-ip/api/`
- **Health Check:** `http://your-ec2-ip/actuator/health`
- **Admin Portal:** `http://your-ec2-ip/admin`

## 🔒 **Security Considerations**

1. **Update Security Groups:** Only open necessary ports
2. **SSL Certificate:** Install Let's Encrypt certificate
3. **Database Security:** Use strong passwords, enable encryption
4. **Regular Updates:** Keep system packages updated
5. **Backup Strategy:** Regular database backups

## 📊 **Monitoring**

### **Health Checks**
```bash
# Backend health
curl http://localhost:8080/actuator/health

# Frontend health
curl http://localhost
```

### **Resource Monitoring**
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Backend not starting:**
   ```bash
   sudo journalctl -u solarcapital-backend -f
   ```

2. **Nginx not serving frontend:**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

3. **Database connection issues:**
   ```bash
   # Check RDS security group
   # Verify database credentials
   ```

4. **Port conflicts:**
   ```bash
   sudo netstat -tlnp | grep :8080
   sudo netstat -tlnp | grep :80
   ```

## ✅ **Deployment Checklist**

- [ ] EC2 instance created and accessible
- [ ] Security groups configured
- [ ] RDS database created and accessible
- [ ] Application deployed successfully
- [ ] Services running (backend + nginx)
- [ ] Health checks passing
- [ ] Database configured
- [ ] Email service configured (optional)
- [ ] SSL certificate installed (optional)
- [ ] Domain configured (optional)

---

**🎉 Your Solar Capital application is now running on a single EC2 instance!** 