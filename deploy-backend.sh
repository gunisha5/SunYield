#!/bin/bash

# Backend Deployment Script for AWS EC2
echo "🚀 Starting Solar Capital Backend Deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo yum update -y

# Install Java 17
echo "☕ Installing Java 17..."
sudo yum install -y java-17-amazon-corretto

# Install Maven
echo "🔨 Installing Maven..."
sudo yum install -y maven

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/solarcapital
sudo chown ec2-user:ec2-user /opt/solarcapital

# Create logs directory
echo "📝 Creating logs directory..."
sudo mkdir -p /var/log/solarcapital
sudo chown ec2-user:ec2-user /var/log/solarcapital

# Copy application files (assuming you've uploaded them)
echo "📋 Copying application files..."
cp -r backend/* /opt/solarcapital/

# Navigate to application directory
cd /opt/solarcapital

# Build the application
echo "🔨 Building application..."
mvn clean package -DskipTests

# Create systemd service file
echo "⚙️ Creating systemd service..."
sudo tee /etc/systemd/system/solarcapital-backend.service > /dev/null <<EOF
[Unit]
Description=Solar Capital Backend
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/solarcapital
ExecStart=/usr/bin/java -jar target/backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start service
echo "🔄 Starting service..."
sudo systemctl daemon-reload
sudo systemctl enable solarcapital-backend
sudo systemctl start solarcapital-backend

# Check service status
echo "📊 Service status:"
sudo systemctl status solarcapital-backend

echo "✅ Backend deployment completed!"
echo "🌐 Application should be running on http://your-ec2-ip:8080" 