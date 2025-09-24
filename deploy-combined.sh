#!/bin/bash

# 🚀 Combined Deployment Script for SunYield (Backend + Frontend on Single EC2)
echo "🚀 Starting SunYield Combined Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Update system packages
print_status "📦 Updating system packages..."
sudo yum update -y

# Install Java 17
print_status "☕ Installing Java 17..."
sudo yum install -y java-17-amazon-corretto

# Install Maven
print_status "🔨 Installing Maven..."
sudo yum install -y maven

# Install Node.js and npm
print_status "📦 Installing Node.js..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install nginx
print_status "🌐 Installing nginx..."
sudo yum install -y nginx

# Create application directories
print_status "📁 Creating application directories..."
sudo mkdir -p /opt/sunyield/backend
sudo mkdir -p /opt/sunyield/frontend
sudo mkdir -p /var/log/sunyield
sudo chown -R ec2-user:ec2-user /opt/sunyield
sudo chown ec2-user:ec2-user /var/log/sunyield

# Copy application files
print_status "📋 Copying application files..."
cp -r backend/* /opt/sunyield/backend/
cp -r frontend/* /opt/sunyield/frontend/

# ===== BACKEND DEPLOYMENT =====
print_status "🔧 Deploying Backend..."

cd /opt/sunyield/backend

# Build the application
print_status "🔨 Building backend application..."
mvn clean package -DskipTests

# Create systemd service for backend
print_status "⚙️ Creating backend systemd service..."
sudo tee /etc/systemd/system/sunyield-backend.service > /dev/null <<EOF
[Unit]
Description=SunYield Backend
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/sunyield/backend
ExecStart=/usr/bin/java -jar target/backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
Restart=always
RestartSec=10
Environment="JAVA_OPTS=-Xmx1g -Xms512m"

[Install]
WantedBy=multi-user.target
EOF

# ===== FRONTEND DEPLOYMENT =====
print_status "🎨 Deploying Frontend..."

cd /opt/sunyield/frontend

# Install dependencies
print_status "📦 Installing frontend dependencies..."
npm install

# Build the application
print_status "🔨 Building frontend application..."
REACT_APP_API_URL=http://localhost:8080 npm run build

# Copy build files to nginx directory
print_status "📋 Copying frontend build files..."
sudo cp -r build/* /usr/share/nginx/html/

# ===== NGINX CONFIGURATION =====
print_status "⚙️ Configuring nginx..."

# Configure nginx for both frontend and backend
sudo tee /etc/nginx/conf.d/sunyield.conf > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    
    # Frontend static files
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
    
    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Auth endpoints
    location /auth/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Admin endpoints
    location /admin/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check endpoint
    location /actuator/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# ===== START SERVICES =====
print_status "🔄 Starting services..."

# Start backend service
sudo systemctl daemon-reload
sudo systemctl enable sunyield-backend
sudo systemctl start sunyield-backend

# Start nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Wait for backend to start
print_status "⏳ Waiting for backend to start..."
sleep 10

# Check service status
print_status "📊 Service Status:"
echo "Backend Status:"
sudo systemctl status sunyield-backend --no-pager -l
echo ""
echo "Nginx Status:"
sudo systemctl status nginx --no-pager -l

# Health checks
print_status "🏥 Running health checks..."
echo "Backend Health Check:"
curl -s http://localhost:8080/actuator/health || echo "Backend not responding"
echo ""
echo "Frontend Health Check:"
curl -s http://localhost | head -n 5 || echo "Frontend not responding"

print_status "✅ Combined deployment completed!"
print_warning "Next steps:"
echo "  1. Update /opt/sunyield/backend/src/main/resources/application-prod.properties"
echo "  2. Configure your RDS database endpoint"
echo "  3. Set up AWS SES for email"
echo "  4. Configure your domain (if applicable)"
echo "  5. Set up SSL certificate"
echo ""
echo "🌐 Your application should be accessible at:"
echo "  - Frontend: http://your-ec2-ip"
echo "  - Backend API: http://your-ec2-ip/api/"
echo "  - Health Check: http://your-ec2-ip/actuator/health" 