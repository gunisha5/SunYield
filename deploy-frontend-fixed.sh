#!/bin/bash

# Memory-Optimized Frontend Deployment Script for AWS EC2
echo "🚀 Starting Solar Capital Frontend Deployment (Memory Optimized)..."

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

# Kill any existing node processes
echo "🔄 Cleaning up existing processes..."
pkill -f npm || true
pkill -f node || true
sleep 2

# Check memory and create swap if needed
MEMORY=$(free -m | awk 'NR==2{printf "%.0f", $2}')
echo "💾 Available Memory: ${MEMORY}MB"

if [ "$MEMORY" -lt 2000 ]; then
    echo "⚠️ Low memory detected. Creating swap space..."
    sudo fallocate -l 2G /swapfile 2>/dev/null || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo "✅ Swap space created"
fi

# Install Node.js using NodeSource repository (more reliable)
echo "📦 Setting up Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
fi

# Verify Node.js installation
echo "🔍 Node.js version: $(node --version)"
echo "🔍 NPM version: $(npm --version)"

# Configure npm for memory efficiency
echo "⚙️ Configuring npm for low memory environments..."
npm config set registry https://registry.npmjs.org/
npm config set fund false
npm config set audit false
npm config set progress false

# Install nginx
echo "🌐 Installing nginx..."
sudo yum install -y nginx

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/solarcapital
sudo chown ec2-user:ec2-user /var/www/solarcapital

# Copy frontend files
echo "📋 Copying application files..."
if [ -d "frontend" ]; then
    cp -r frontend/* /var/www/solarcapital/
else
    echo "❌ Frontend directory not found. Please ensure you're in the project root directory."
    exit 1
fi

# Navigate to frontend directory
cd /var/www/solarcapital

# Create .env file for production
echo "⚙️ Creating production environment file..."
cat > .env.production << EOF
REACT_APP_API_URL=http://$PUBLIC_IP:8080
GENERATE_SOURCEMAP=false
NODE_OPTIONS="--max-old-space-size=1024"
EOF

# Clean previous installations
echo "🧹 Cleaning previous installations..."
rm -rf node_modules package-lock.json .npm

# Install dependencies with memory optimizations
echo "📦 Installing dependencies (this may take a while)..."
export NODE_OPTIONS="--max-old-space-size=1024"
npm install --no-audit --no-fund --prefer-offline

# Check if dependencies installed successfully
if [ ! -d "node_modules" ]; then
    echo "❌ Dependency installation failed"
    exit 1
fi

# Build the application with memory limits and timeout
echo "🔨 Building application (with memory optimizations)..."
export NODE_OPTIONS="--max-old-space-size=1024"
export CI=false

# Build with timeout to prevent hanging
timeout 600 npm run build

# Check build status
BUILD_EXIT_CODE=$?
if [ $BUILD_EXIT_CODE -eq 124 ]; then
    echo "⚠️ Build timed out after 10 minutes. Trying alternative build method..."
    
    # Try building with even stricter memory limits
    export NODE_OPTIONS="--max-old-space-size=512"
    timeout 900 npm run build
    BUILD_EXIT_CODE=$?
fi

# Check if build was successful
if [ $BUILD_EXIT_CODE -ne 0 ] || [ ! -d "build" ]; then
    echo "❌ Build failed. Trying fallback method..."
    
    # Fallback: Build with minimal memory
    echo "🔄 Attempting fallback build method..."
    rm -rf build
    export NODE_OPTIONS="--max-old-space-size=512 --optimize-for-size"
    npm run build -- --production
    
    if [ ! -d "build" ]; then
        echo "❌ All build attempts failed. Please check logs above."
        echo "💡 Try deploying on a larger instance type (t3.small or higher)"
        exit 1
    fi
fi

echo "✅ Build completed successfully!"

# Copy build files to nginx directory
echo "📋 Copying build files to nginx..."
sudo rm -rf /usr/share/nginx/html/*
sudo cp -r build/* /usr/share/nginx/html/

# Configure nginx
echo "⚙️ Configuring nginx..."
sudo tee /etc/nginx/conf.d/solarcapital.conf > /dev/null <<EOF
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
        
        # Increase timeout for API calls
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
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
if curl -f http://localhost 2>/dev/null; then
    echo "✅ Frontend is accessible"
else
    echo "⚠️ Frontend test inconclusive, but nginx is running"
fi

# Clean up swap if we created it temporarily
if [ "$MEMORY" -lt 2000 ]; then
    echo "🧹 Cleaning up temporary swap..."
    sudo swapoff /swapfile || true
    sudo rm -f /swapfile || true
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