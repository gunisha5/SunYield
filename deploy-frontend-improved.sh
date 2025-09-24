#!/bin/bash

# Enhanced Frontend Deployment Script for AWS EC2
echo "🚀 Starting SunYield Frontend Deployment..."

# Get the current EC2 public IP
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)
if [ -z "$PUBLIC_IP" ]; then
    echo "❌ Could not determine public IP"
    exit 1
fi

echo "📡 Detected Public IP: $PUBLIC_IP"

# Check if running as ec2-user
if [ "$(whoami)" != "ec2-user" ]; then
    echo "❌ Please run this script as ec2-user"
    exit 1
fi

# Install Node.js and npm if not already installed
echo "📦 Setting up Node.js..."
if ! command -v node &> /dev/null; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    source ~/.bashrc
    nvm install 18
    nvm use 18
fi

# Verify Node.js installation
node --version
npm --version
if [ $? -ne 0 ]; then
    echo "❌ Node.js installation failed"
    exit 1
fi

# Install nginx
echo "🌐 Installing nginx..."
sudo yum install -y nginx

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/sunyield
sudo chown ec2-user:ec2-user /var/www/sunyield

# Copy frontend files (assuming frontend folder exists in current directory)
echo "📋 Copying application files..."
if [ -d "frontend" ]; then
    cp -r frontend/* /var/www/sunyield/
else
    echo "❌ Frontend directory not found. Please ensure you're in the project root directory."
    exit 1
fi

# Navigate to frontend directory
cd /var/www/sunyield

# Create .env file for production
echo "⚙️ Creating production environment file..."
cat > .env.production << EOF
REACT_APP_API_URL=http://$PUBLIC_IP:8080
GENERATE_SOURCEMAP=false
EOF

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "❌ Build failed - build directory not found"
    exit 1
fi

# Copy build files to nginx directory
echo "📋 Copying build files to nginx..."
sudo rm -rf /usr/share/nginx/html/*
sudo cp -r build/* /usr/share/nginx/html/

# Configure nginx
echo "⚙️ Configuring nginx..."
sudo tee /etc/nginx/conf.d/sunyield.conf > /dev/null <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $PUBLIC_IP;
    root /usr/share/nginx/html;
    index index.html;

    # Handle React Router - all routes should serve index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy to backend
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
        
        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Remove default nginx config
sudo rm -f /etc/nginx/conf.d/default.conf

# Test nginx configuration
echo "🔍 Testing nginx configuration..."
sudo nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration test failed"
    exit 1
fi

# Start nginx
echo "🔄 Starting nginx..."
sudo systemctl enable nginx
sudo systemctl restart nginx

# Wait for nginx to start
sleep 5

# Check nginx status
echo "📊 Nginx status:"
sudo systemctl status nginx --no-pager

# Test if frontend is accessible
echo "🌐 Testing frontend..."
if curl -f http://localhost 2>/dev/null | grep -q "SunYield" 2>/dev/null; then
    echo "✅ Frontend is accessible"
else
    echo "⚠️ Frontend test inconclusive, but nginx is running"
fi

echo "✅ Frontend deployment completed!"
echo "🌐 Frontend URL: http://$PUBLIC_IP"
echo "🌐 Backend API URL: http://$PUBLIC_IP:8080"
echo ""
echo "📋 Quick health check URLs:"
echo "   Frontend: http://$PUBLIC_IP"
echo "   Backend Health: http://$PUBLIC_IP:8080/actuator/health"
echo ""
echo "📋 Useful commands:"
echo "   Check nginx status: sudo systemctl status nginx"
echo "   Check nginx logs: sudo journalctl -u nginx -f"
echo "   Restart nginx: sudo systemctl restart nginx" 