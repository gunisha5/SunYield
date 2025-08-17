#!/bin/bash

# 🚀 Simplified Deployment Script with Configuration File
echo "🚀 Solar Capital Deployment with Configuration"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if config file exists
if [ ! -f "config.env" ]; then
    print_error "Configuration file 'config.env' not found!"
    echo ""
    echo "Please:"
    echo "1. Copy config-template.env to config.env"
    echo "2. Fill in your actual values in config.env"
    echo "3. Run this script again"
    exit 1
fi

# Load configuration
print_status "Loading configuration from config.env..."
source config.env

# Validate required configuration
required_vars=("GITHUB_USERNAME" "GITHUB_REPO_NAME" "EC2_IP" "EC2_KEY_PATH" "RDS_ENDPOINT" "RDS_USERNAME" "RDS_PASSWORD" "BACKEND_DOMAIN")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Missing required configuration: $var"
        exit 1
    fi
done

print_status "Configuration validated successfully"

# Update configuration files
print_step "Updating Configuration Files"

# Update backend database configuration
print_status "Updating backend database configuration..."
cp backend/src/main/resources/application-prod.properties backend/src/main/resources/application-prod.properties.backup

sed -i "s|jdbc:mysql://localhost:3306/solarcapital|jdbc:mysql://$RDS_ENDPOINT:3306/solarcapital|g" backend/src/main/resources/application-prod.properties
sed -i "s|spring.datasource.username=root|spring.datasource.username=$RDS_USERNAME|g" backend/src/main/resources/application-prod.properties
sed -i "s|spring.datasource.password=password|spring.datasource.password=$RDS_PASSWORD|g" backend/src/main/resources/application-prod.properties

# Update CORS configuration
if [ -n "$CORS_ALLOWED_ORIGINS" ]; then
    sed -i "s|cors.allowed-origins=.*|cors.allowed-origins=$CORS_ALLOWED_ORIGINS|g" backend/src/main/resources/application-prod.properties
fi

# Update JWT configuration
if [ -n "$JWT_SECRET" ]; then
    sed -i "s|jwt.secret=.*|jwt.secret=$JWT_SECRET|g" backend/src/main/resources/application-prod.properties
fi

# Update frontend API configuration
print_status "Updating frontend API configuration..."
cp frontend/src/services/api.ts frontend/src/services/api.ts.backup

# Check if API_BASE_URL exists in the file
if grep -q "API_BASE_URL" frontend/src/services/api.ts; then
    sed -i "s|const API_BASE_URL = '.*'|const API_BASE_URL = 'http://$BACKEND_DOMAIN:8080'|g" frontend/src/services/api.ts
else
    # Add API_BASE_URL if it doesn't exist
    sed -i "1i const API_BASE_URL = 'http://$BACKEND_DOMAIN:8080';" frontend/src/services/api.ts
fi

# Update deployment scripts
print_status "Updating deployment scripts..."

# Update backend deployment script
if [ -f "deploy-backend.sh" ]; then
    cp deploy-backend.sh deploy-backend.sh.backup
    # Add any backend-specific configurations here if needed
fi

# Update frontend deployment script
if [ -f "deploy-frontend.sh" ]; then
    cp deploy-frontend.sh deploy-frontend.sh.backup
    sed -i "s|REACT_APP_API_URL=https://your-backend-domain.com|REACT_APP_API_URL=http://$BACKEND_DOMAIN:8080|g" deploy-frontend.sh
    sed -i "s|server_name your-domain.com www.your-domain.com|server_name $FRONTEND_DOMAIN|g" deploy-frontend.sh
fi

# Git operations
print_step "Git Operations"

# Initialize git if not already done
if [ ! -d ".git" ]; then
    print_status "Initializing Git repository..."
    git init
fi

# Add all changes
git add .
git commit -m "Update configuration for deployment - $(date)"

# Add or update remote
if git remote get-url origin > /dev/null 2>&1; then
    git remote set-url origin "https://github.com/$GITHUB_USERNAME/$GITHUB_REPO_NAME.git"
else
    git remote add origin "https://github.com/$GITHUB_USERNAME/$GITHUB_REPO_NAME.git"
fi

# Force push
print_status "Pushing to GitHub..."
git branch -M main
git push -f origin main

if [ $? -ne 0 ]; then
    print_error "Failed to push to GitHub"
    exit 1
fi

# Deploy to EC2
print_step "Deploying to EC2"

# Create EC2 deployment script
cat > ec2-deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying Solar Capital to EC2..."

# Stop services
sudo systemctl stop solarcapital-backend 2>/dev/null || true
sudo systemctl stop nginx 2>/dev/null || true

# Backup
sudo cp -r /opt/solarcapital /opt/solarcapital-backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true
sudo cp -r /var/www/solarcapital /var/www/solarcapital-backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true

# Clean up
sudo rm -rf /opt/solarcapital
sudo rm -rf /var/www/solarcapital

# Clone and deploy
cd /home/ec2-user
git clone https://github.com/REPLACE_GITHUB_USERNAME/REPLACE_GITHUB_REPO_NAME.git solarcapital-backend
cd solarcapital-backend

# Deploy backend
if [ -f "deploy-backend.sh" ]; then
    chmod +x deploy-backend.sh
    ./deploy-backend.sh
fi

# Deploy frontend
if [ -f "deploy-frontend.sh" ]; then
    chmod +x deploy-frontend.sh
    ./deploy-frontend.sh
fi

echo "✅ Deployment completed!"
EOF

# Update placeholders
sed -i "s/REPLACE_GITHUB_USERNAME/$GITHUB_USERNAME/g" ec2-deploy.sh
sed -i "s/REPLACE_GITHUB_REPO_NAME/$GITHUB_REPO_NAME/g" ec2-deploy.sh

chmod +x ec2-deploy.sh

# Copy and execute on EC2
print_status "Copying deployment script to EC2..."
scp -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no ec2-deploy.sh ec2-user@$EC2_IP:/home/ec2-user/

if [ $? -ne 0 ]; then
    print_error "Failed to copy deployment script to EC2"
    exit 1
fi

print_status "Executing deployment on EC2..."
ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no ec2-user@$EC2_IP "chmod +x /home/ec2-user/ec2-deploy.sh && /home/ec2-user/ec2-deploy.sh"

if [ $? -ne 0 ]; then
    print_error "Deployment failed on EC2"
    exit 1
fi

# Verification
print_step "Verification"

print_status "Testing backend health..."
ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no ec2-user@$EC2_IP "curl -s http://localhost:8080/actuator/health"

print_status "Testing frontend..."
ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no ec2-user@$EC2_IP "curl -s -I http://localhost:80"

# Cleanup
rm -f ec2-deploy.sh

print_status "🎉 Deployment completed successfully!"
print_warning "Next steps:"
echo "  - Test your application at http://$EC2_IP"
echo "  - Update DNS records if you have a domain"
echo "  - Configure SSL certificates"
echo "  - Set up monitoring and backups"
