#!/bin/bash

# Frontend Deployment Script for AWS EC2
echo "🚀 Starting SunYield Frontend Deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo yum update -y

# Install Node.js and npm
echo "📦 Installing Node.js..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install nginx
echo "🌐 Installing nginx..."
sudo yum install -y nginx

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/sunyield
sudo chown ec2-user:ec2-user /var/www/sunyield

# Copy application files (assuming you've uploaded them)
echo "📋 Copying application files..."
cp -r frontend/* /var/www/sunyield/

# Navigate to application directory
cd /var/www/sunyield

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
REACT_APP_API_URL=https://your-backend-domain.com npm run build

# Copy build files to nginx directory
echo "📋 Copying build files..."
sudo cp -r build/* /usr/share/nginx/html/

# Configure nginx
echo "⚙️ Configuring nginx..."
sudo tee /etc/nginx/conf.d/sunyield.conf > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /usr/share/nginx/html;
    index index.html;

    # Handle React Router
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy (if needed)
    location /api/ {
        proxy_pass https://your-backend-domain.com;
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
}
EOF

# Start nginx
echo "🔄 Starting nginx..."
sudo systemctl enable nginx
sudo systemctl start nginx

# Check nginx status
echo "📊 Nginx status:"
sudo systemctl status nginx

echo "✅ Frontend deployment completed!"
echo "🌐 Application should be running on http://your-domain.com" 