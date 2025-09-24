#!/bin/bash

# Enhanced Backend Deployment Script for AWS EC2
echo "🚀 Starting SunYield Backend Deployment..."

# Set variables
APP_DIR="/opt/sunyield"
LOG_DIR="/var/log/sunyield"
SERVICE_NAME="sunyield-backend"

# Check if running as ec2-user
if [ "$(whoami)" != "ec2-user" ]; then
    echo "❌ Please run this script as ec2-user"
    exit 1
fi

# Update system packages
echo "📦 Updating system packages..."
sudo yum update -y

# Install Java 17
echo "☕ Installing Java 17..."
sudo yum install -y java-17-amazon-corretto

# Verify Java installation
java -version
if [ $? -ne 0 ]; then
    echo "❌ Java installation failed"
    exit 1
fi

# Install Maven
echo "🔨 Installing Maven..."
sudo yum install -y maven

# Verify Maven installation
mvn -version
if [ $? -ne 0 ]; then
    echo "❌ Maven installation failed"
    exit 1
fi

# Install and setup MySQL
echo "🗄️ Installing MySQL..."
sudo yum install -y mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Wait for MySQL to start
sleep 10

# Create database and user (using expect to automate mysql_secure_installation)
echo "🔐 Setting up MySQL database..."
mysql -u root << EOF
ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';
CREATE DATABASE IF NOT EXISTS sunyield;
FLUSH PRIVILEGES;
EOF

# Test database connection
mysql -u root -ppassword -e "SHOW DATABASES;" | grep sunyield
if [ $? -ne 0 ]; then
    echo "❌ Database setup failed"
    exit 1
fi

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown ec2-user:ec2-user $APP_DIR

# Create logs directory
echo "📝 Creating logs directory..."
sudo mkdir -p $LOG_DIR
sudo chown ec2-user:ec2-user $LOG_DIR

# Copy application files (assuming backend folder exists in current directory)
echo "📋 Copying application files..."
if [ -d "backend" ]; then
    cp -r backend/* $APP_DIR/
else
    echo "❌ Backend directory not found. Please ensure you're in the project root directory."
    exit 1
fi

# Navigate to application directory
cd $APP_DIR

# Update application-prod.properties with actual values
echo "⚙️ Updating production configuration..."
sed -i 's/your-rds-endpoint/localhost/g' src/main/resources/application-prod.properties
sed -i 's/your_db_username/root/g' src/main/resources/application-prod.properties
sed -i 's/your_db_password/password/g' src/main/resources/application-prod.properties

# Build the application
echo "🔨 Building application..."
mvn clean package -DskipTests

# Check if JAR file was created
if [ ! -f "target/backend-0.0.1-SNAPSHOT.jar" ]; then
    echo "❌ Build failed - JAR file not found"
    exit 1
fi

# Create systemd service file
echo "⚙️ Creating systemd service..."
sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null <<EOF
[Unit]
Description=SunYield Backend
After=network.target mysqld.service
Wants=mysqld.service

[Service]
Type=simple
User=ec2-user
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/java -jar target/backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start service
echo "🔄 Starting service..."
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME

# Wait for service to start
sleep 15

# Check service status
echo "📊 Service status:"
sudo systemctl status $SERVICE_NAME --no-pager

# Check if application is responding
echo "🌐 Testing application..."
if curl -f http://localhost:8080/actuator/health 2>/dev/null; then
    echo "✅ Backend is healthy and responding"
else
    echo "⚠️ Backend might be starting up or there might be an issue"
    echo "📋 Recent logs:"
    sudo journalctl -u $SERVICE_NAME --no-pager -n 20
fi

echo "✅ Backend deployment completed!"
echo "🌐 Application should be running on http://$(curl -s http://checkip.amazonaws.com):8080"
echo "📋 To check logs: sudo journalctl -u $SERVICE_NAME -f" 