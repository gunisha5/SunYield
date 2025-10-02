# 🚀 SunYield AWS Complete Deployment Guide

## 📋 Prerequisites
- AWS Account with billing enabled
- Domain name (optional, can use EC2 public IP)
- PuTTY or SSH client
- Your SunYield project ready

## 🎯 Step 1: Create EC2 Instance

### 1.1 Launch EC2 Instance
1. **Go to AWS Console → EC2 → Launch Instance**
2. **Configure Instance:**
   - **Name:** `SunYield-Production`
   - **AMI:** Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance Type:** `t3.small` (recommended) or `t2.micro` (free tier)
   - **Key Pair:** Create new key pair `sunyield-key` (download .pem file)
   - **Storage:** 30 GB gp3

### 1.2 Configure Security Group
**Create Security Group:** `SunYield-Security-Group`

**Inbound Rules:**
```
Type          Protocol    Port Range    Source
SSH           TCP         22            Your IP/32
HTTP          TCP         80            0.0.0.0/0
HTTPS         TCP         443           0.0.0.0/0
Custom TCP    TCP         8080          0.0.0.0/0
Custom TCP    TCP         3000          0.0.0.0/0
```

### 1.3 Launch and Connect
1. **Launch Instance**
2. **Note the Public IP address**
3. **Convert .pem to .ppk using PuTTYgen** (for PuTTY)

## 🎯 Step 2: Create RDS MySQL Database

### 2.1 Create RDS Instance
1. **Go to AWS Console → RDS → Create Database**
2. **Configuration:**
   - **Engine:** MySQL 8.0
   - **Template:** Free tier
   - **DB Instance Identifier:** `sunyield-db`
   - **Master Username:** `admin`
   - **Master Password:** `[Create strong password]`
   - **Instance Class:** `db.t3.micro` (free tier)
   - **Storage:** 20 GB gp2
   - **VPC:** Same as EC2
   - **Subnet Group:** Default

### 2.2 Configure RDS Security Group
**Create Security Group:** `SunYield-RDS-Security-Group`

**Inbound Rules:**
```
Type          Protocol    Port Range    Source
MySQL         TCP         3306          SunYield-Security-Group
```

### 2.3 Note Database Endpoint
- **Save the RDS endpoint** (e.g., `sunyield-db.xxxxx.us-east-1.rds.amazonaws.com`)
- **Save the database credentials**

## 🎯 Step 3: Domain Setup (Optional)

### 3.1 Register Domain (Route 53)
1. **Go to Route 53 → Register Domain**
2. **Choose domain** (e.g., `sunyield.com`)
3. **Complete registration**

### 3.2 Configure DNS
1. **Create A Record:**
   - **Name:** `@` (root domain)
   - **Type:** A
   - **Value:** Your EC2 Public IP
   - **TTL:** 300

2. **Create CNAME Record:**
   - **Name:** `www`
   - **Type:** CNAME
   - **Value:** `yourdomain.com`

## 🎯 Step 4: Update Application Properties

### 4.1 Update application-prod.properties
Replace the following values in `backend/src/main/resources/application-prod.properties`:

```properties
# Database Configuration (Replace with your RDS endpoint)
spring.datasource.url=jdbc:mysql://YOUR_RDS_ENDPOINT:3306/sunyield?useSSL=false&serverTimezone=UTC
spring.datasource.username=admin
spring.datasource.password=YOUR_DATABASE_PASSWORD

# CORS Configuration (Replace with your domain)
cors.allowed-origins=https://yourdomain.com,http://yourdomain.com,https://www.yourdomain.com,http://www.yourdomain.com
```

### 4.2 Environment Variables
Create `.env` file on EC2:
```bash
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=3306
DB_NAME=sunyield
DB_USER=admin
DB_PASSWORD=your-database-password
```

## 🎯 Step 5: Deploy via PuTTY

### 5.1 Connect to EC2
1. **Open PuTTY**
2. **Host Name:** Your EC2 Public IP
3. **Port:** 22
4. **Connection Type:** SSH
5. **Load your .ppk key file**
6. **Connect**

### 5.2 Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Java 17
sudo apt install openjdk-17-jdk -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Maven
sudo apt install maven -y

# Install Nginx
sudo apt install nginx -y

# Install MySQL client
sudo apt install mysql-client -y
```

### 5.3 Clone and Build Project
```bash
# Clone your repository
git clone https://github.com/gunisha5/SunYield.git
cd SunYield

# Build Backend
cd backend
mvn clean package -DskipTests
cd ..

# Build Frontend
cd frontend
npm install
npm run build
cd ..
```

### 5.4 Configure Nginx
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/sunyield

# Add this configuration:
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Frontend
    location / {
        root /home/ubuntu/SunYield/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/sunyield /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5.5 Create Systemd Service
```bash
# Create backend service
sudo nano /etc/systemd/system/sunyield-backend.service

# Add this configuration:
[Unit]
Description=SunYield Backend Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/SunYield/backend
ExecStart=/usr/bin/java -jar target/backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable sunyield-backend
sudo systemctl start sunyield-backend
```

### 5.6 Initialize Database
```bash
# Connect to RDS and create database
mysql -h YOUR_RDS_ENDPOINT -u admin -p

# In MySQL:
CREATE DATABASE sunyield;
USE sunyield;
# Run your SQL scripts here
exit
```

## 🎯 Step 6: SSL Certificate (Optional)

### 6.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 6.2 Get SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 🎯 Step 7: Final Verification

### 7.1 Check Services
```bash
# Check backend service
sudo systemctl status sunyield-backend

# Check Nginx
sudo systemctl status nginx

# Check logs
sudo journalctl -u sunyield-backend -f
```

### 7.2 Test Application
1. **Visit your domain:** `https://yourdomain.com`
2. **Test API:** `https://yourdomain.com/api/health`
3. **Check database connection**

## 🔧 Troubleshooting

### Common Issues:
1. **Database Connection Failed:**
   - Check RDS security group
   - Verify database credentials
   - Check VPC configuration

2. **Frontend Not Loading:**
   - Check Nginx configuration
   - Verify build files exist
   - Check file permissions

3. **Backend Not Starting:**
   - Check Java version
   - Verify JAR file exists
   - Check application logs

## 📊 Monitoring

### 7.1 CloudWatch (Optional)
- Enable CloudWatch monitoring
- Set up alarms for CPU, memory, disk usage
- Monitor database performance

### 7.2 Log Management
```bash
# View application logs
sudo journalctl -u sunyield-backend -f

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🎉 Success!

Your SunYield application should now be running on AWS with:
- ✅ EC2 instance hosting frontend and backend
- ✅ RDS MySQL database
- ✅ Custom domain (optional)
- ✅ SSL certificate (optional)
- ✅ Production-ready configuration

## 📞 Support

If you encounter any issues:
1. Check the logs first
2. Verify security group configurations
3. Ensure all services are running
4. Test database connectivity

**Your application is now live on AWS! 🚀**
