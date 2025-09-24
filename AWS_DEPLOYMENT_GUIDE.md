# AWS Deployment Guide for SunYield Project

This guide will help you deploy your SunYield project on AWS with a custom domain and MySQL database.

## Prerequisites

- AWS Account
- Domain name (from any registrar like GoDaddy, Namecheap, etc.)
- Basic knowledge of AWS services
- Your project code ready

## Step 1: Set Up AWS RDS MySQL Database

### 1.1 Create RDS MySQL Instance

1. **Login to AWS Console**
   - Go to [AWS Console](https://console.aws.amazon.com)
   - Navigate to **RDS** service

2. **Create Database**
   - Click "Create database"
   - Choose "Standard create"
   - Engine type: **MySQL**
   - Version: **MySQL 8.0** (recommended)
   - Templates: **Free tier** (for testing) or **Production** (for production)

3. **Database Configuration**
   ```
   DB instance identifier: sunyield-db
   Master username: admin
   Master password: [Create a strong password]
   DB instance class: db.t3.micro (free tier) or db.t3.small (production)
   Storage: 20 GB (minimum)
   ```

4. **Connectivity**
   - VPC: Default VPC
   - Subnet group: Default
   - Public access: **Yes** (for easier connection)
   - VPC security groups: Create new
   - Availability Zone: No preference

5. **Additional Configuration**
   - Initial database name: `sunyield`
   - Backup retention: 7 days
   - Monitoring: Enable enhanced monitoring

### 1.2 Configure Security Group

1. **Find your RDS security group**
   - Go to EC2 → Security Groups
   - Find the security group created for your RDS instance

2. **Add inbound rules**
   ```
   Type: MySQL/Aurora
   Port: 3306
   Source: 0.0.0.0/0 (for testing) or your EC2 security group
   ```

## Step 2: Set Up EC2 Instance for Application

### 2.1 Launch EC2 Instance

1. **Go to EC2 Console**
   - Navigate to **EC2** service
   - Click "Launch instance"

2. **Choose AMI**
   - Select **Ubuntu Server 22.04 LTS** (Free tier eligible)

3. **Instance Type**
   - **t2.micro** (free tier) or **t3.small** (production)

4. **Key Pair**
   - Create new key pair: `sunyield-key`
   - Download the .pem file

5. **Network Settings**
   - Create new security group: `sunyield-app-sg`
   - Add rules:
     ```
     SSH (22): Your IP
     HTTP (80): 0.0.0.0/0
     HTTPS (443): 0.0.0.0/0
     Custom TCP (8080): 0.0.0.0/0 (for Spring Boot)
     ```

6. **Storage**
   - 8 GB (free tier) or 20 GB (production)

### 2.2 Connect to EC2 Instance

```bash
# Make key file secure
chmod 400 sunyield-key.pem

# Connect to instance
ssh -i sunyield-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

## Step 3: Install Required Software

### 3.1 Update System and Install Java

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Java 17
sudo apt install openjdk-17-jdk -y

# Verify installation
java -version
```

### 3.2 Install Node.js and npm

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3.3 Install MySQL Client

```bash
sudo apt install mysql-client -y
```

### 3.4 Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 4: Deploy Backend (Spring Boot)

### 4.1 Prepare Backend

1. **Update application-prod.properties**
   ```properties
   # Database Configuration
   spring.datasource.url=jdbc:mysql://YOUR_RDS_ENDPOINT:3306/sunyield?useSSL=false&serverTimezone=UTC
   spring.datasource.username=admin
   spring.datasource.password=YOUR_RDS_PASSWORD
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
   
   # JPA Configuration
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=false
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
   
   # Server Configuration
   server.port=8080
   server.servlet.context-path=/api
   
   # CORS Configuration
   cors.allowed-origins=https://yourdomain.com,http://yourdomain.com
   cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
   cors.allowed-headers=*
   cors.allow-credentials=true
   ```

2. **Build the JAR file**
   ```bash
   # On your local machine
   cd backend
   ./mvnw clean package -DskipTests
   ```

3. **Upload to EC2**
   ```bash
   # From your local machine
   scp -i sunyield-key.pem backend/target/backend-0.0.1-SNAPSHOT.jar ubuntu@YOUR_EC2_IP:/home/ubuntu/
   ```

### 4.2 Set Up Backend Service

1. **Create systemd service**
   ```bash
   sudo nano /etc/systemd/system/sunyield-backend.service
   ```

2. **Add service configuration**
   ```ini
   [Unit]
   Description=SunYield Backend Service
   After=network.target

   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/home/ubuntu
   ExecStart=/usr/bin/java -jar /home/ubuntu/backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

3. **Start the service**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable sunyield-backend
   sudo systemctl start sunyield-backend
   sudo systemctl status sunyield-backend
   ```

## Step 5: Deploy Frontend (React)

### 5.1 Build Frontend

1. **On your local machine**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Upload build files**
   ```bash
   # Create directory on EC2
   ssh -i sunyield-key.pem ubuntu@YOUR_EC2_IP "mkdir -p /var/www/sunyield"
   
   # Upload build files
   scp -i sunyield-key.pem -r frontend/build/* ubuntu@YOUR_EC2_IP:/var/www/sunyield/
   ```

### 5.2 Configure Nginx

1. **Create Nginx configuration**
   ```bash
   sudo nano /etc/nginx/sites-available/sunyield
   ```

2. **Add configuration**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       # Frontend
       location / {
           root /var/www/sunyield;
           index index.html;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
       
       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-XSS-Protection "1; mode=block" always;
       add_header X-Content-Type-Options "nosniff" always;
   }
   ```

3. **Enable the site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/sunyield /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Step 6: Set Up Domain and SSL

### 6.1 Configure Domain DNS

1. **Get your EC2 public IP**
   ```bash
   curl http://169.254.169.254/latest/meta-data/public-ipv4
   ```

2. **Update DNS records in your domain registrar**
   ```
   A Record: @ → YOUR_EC2_PUBLIC_IP
   A Record: www → YOUR_EC2_PUBLIC_IP
   ```

### 6.2 Install SSL Certificate

1. **Install Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. **Get SSL certificate**
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **Test auto-renewal**
   ```bash
   sudo certbot renew --dry-run
   ```

## Step 7: Database Setup

### 7.1 Connect to RDS and Create Database

```bash
# Connect to RDS
mysql -h YOUR_RDS_ENDPOINT -u admin -p

# Create database and user
CREATE DATABASE sunyield;
USE sunyield;

# Create application user (optional)
CREATE USER 'sunyield_user'@'%' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON sunyield.* TO 'sunyield_user'@'%';
FLUSH PRIVILEGES;
```

### 7.2 Run Database Migrations

The Spring Boot application will automatically create tables on first startup with the `spring.jpa.hibernate.ddl-auto=update` configuration.

## Step 8: Environment Configuration

### 8.1 Create Environment File

```bash
sudo nano /home/ubuntu/.env
```

```env
# Database
DB_HOST=YOUR_RDS_ENDPOINT
DB_PORT=3306
DB_NAME=sunyield
DB_USER=admin
DB_PASSWORD=YOUR_RDS_PASSWORD

# Application
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080

# Email (if using)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 8.2 Update Application Properties

Make sure your `application-prod.properties` uses environment variables:

```properties
spring.datasource.url=jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?useSSL=false&serverTimezone=UTC
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
```

## Step 9: Monitoring and Logs

### 9.1 View Application Logs

```bash
# Backend logs
sudo journalctl -u sunyield-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 9.2 Set Up CloudWatch (Optional)

1. **Install CloudWatch agent**
   ```bash
   wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
   sudo dpkg -i amazon-cloudwatch-agent.deb
   ```

2. **Configure CloudWatch**
   ```bash
   sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
   ```

## Step 10: Security Best Practices

### 10.1 Update Security Groups

1. **Restrict SSH access**
   - Only allow SSH from your IP
   - Remove 0.0.0.0/0 access

2. **Database security**
   - Remove public access to RDS
   - Only allow access from EC2 security group

### 10.2 Set Up Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow necessary ports
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
```

## Step 11: Backup Strategy

### 11.1 Database Backups

```bash
# Create backup script
sudo nano /home/ubuntu/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -h YOUR_RDS_ENDPOINT -u admin -p sunyield > /home/ubuntu/backups/sunyield_$DATE.sql
find /home/ubuntu/backups -name "*.sql" -mtime +7 -delete
```

### 11.2 Application Backups

```bash
# Create backup directory
mkdir -p /home/ubuntu/backups

# Backup application files
tar -czf /home/ubuntu/backups/app_$(date +%Y%m%d).tar.gz /var/www/sunyield
```

## Step 12: Deployment Scripts

### 12.1 Create Deployment Script

```bash
nano /home/ubuntu/deploy.sh
```

```bash
#!/bin/bash

# Pull latest code
git pull origin main

# Build backend
cd backend
./mvnw clean package -DskipTests

# Build frontend
cd ../frontend
npm install
npm run build

# Deploy backend
sudo systemctl stop sunyield-backend
cp target/backend-0.0.1-SNAPSHOT.jar /home/ubuntu/
sudo systemctl start sunyield-backend

# Deploy frontend
sudo rm -rf /var/www/sunyield/*
sudo cp -r build/* /var/www/sunyield/

# Restart services
sudo systemctl reload nginx
sudo systemctl status sunyield-backend
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check RDS endpoint
   nslookup YOUR_RDS_ENDPOINT
   
   # Test connection
   mysql -h YOUR_RDS_ENDPOINT -u admin -p
   ```

2. **Application Not Starting**
   ```bash
   # Check logs
   sudo journalctl -u sunyield-backend -n 50
   
   # Check Java process
   ps aux | grep java
   ```

3. **Nginx Issues**
   ```bash
   # Test configuration
   sudo nginx -t
   
   # Check status
   sudo systemctl status nginx
   ```

## Cost Optimization

### Free Tier Usage
- EC2 t2.micro: 750 hours/month
- RDS db.t3.micro: 750 hours/month
- 20 GB storage
- 1 GB database storage

### Production Recommendations
- Use Application Load Balancer
- Set up Auto Scaling
- Use RDS Multi-AZ for high availability
- Implement CloudFront for CDN
- Set up Route 53 for DNS management

## Next Steps

1. Set up monitoring with CloudWatch
2. Implement CI/CD pipeline with GitHub Actions
3. Set up automated backups
4. Configure log aggregation
5. Implement security scanning
6. Set up performance monitoring

---

**Note**: Replace `YOUR_RDS_ENDPOINT`, `YOUR_EC2_PUBLIC_IP`, and `yourdomain.com` with your actual values throughout this guide.
