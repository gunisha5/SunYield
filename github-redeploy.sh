#!/bin/bash

# 🚀 GitHub Repository Replacement and EC2 Redeployment Script
echo "🚀 SunYield GitHub Replacement and EC2 Redeployment"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if running locally (not on EC2)
if curl -s http://169.254.169.254/latest/meta-data/instance-id > /dev/null 2>&1; then
    print_error "This script should be run locally, not on EC2"
    exit 1
fi

# Configuration variables
GITHUB_USERNAME=""
GITHUB_REPO_NAME=""
EC2_IP=""
EC2_KEY_PATH=""
RDS_ENDPOINT=""
RDS_USERNAME=""
RDS_PASSWORD=""
BACKEND_DOMAIN=""

# Function to get user input
get_input() {
    local prompt="$1"
    local var_name="$2"
    local default_value="$3"
    
    if [ -n "$default_value" ]; then
        read -p "$prompt [$default_value]: " input
        if [ -z "$input" ]; then
            input="$default_value"
        fi
    else
        read -p "$prompt: " input
    fi
    
    eval "$var_name='$input'"
}

# Get configuration from user
print_step "Configuration Setup"
echo "Please provide the following information:"
echo ""

get_input "GitHub Username" GITHUB_USERNAME
get_input "GitHub Repository Name" GITHUB_REPO_NAME
get_input "EC2 Instance IP Address" EC2_IP
get_input "EC2 Private Key Path (.pem file)" EC2_KEY_PATH
get_input "RDS Endpoint" RDS_ENDPOINT
get_input "RDS Username" RDS_USERNAME
get_input "RDS Password" RDS_PASSWORD
get_input "Backend Domain/IP (for frontend API calls)" BACKEND_DOMAIN

# Validate inputs
if [ -z "$GITHUB_USERNAME" ] || [ -z "$GITHUB_REPO_NAME" ] || [ -z "$EC2_IP" ] || [ -z "$EC2_KEY_PATH" ]; then
    print_error "Missing required configuration values"
    exit 1
fi

# Check if key file exists
if [ ! -f "$EC2_KEY_PATH" ]; then
    print_error "EC2 key file not found: $EC2_KEY_PATH"
    exit 1
fi

print_status "Configuration validated successfully"

# Step 1: Update configuration files
print_step "Updating Configuration Files"

# Update backend database configuration
if [ -n "$RDS_ENDPOINT" ] && [ -n "$RDS_USERNAME" ] && [ -n "$RDS_PASSWORD" ]; then
    print_status "Updating backend database configuration..."
    
    # Create backup of original file
    cp backend/src/main/resources/application-prod.properties backend/src/main/resources/application-prod.properties.backup
    
    # Update database configuration
    sed -i "s|jdbc:mysql://localhost:3306/sunyield|jdbc:mysql://$RDS_ENDPOINT:3306/sunyield|g" backend/src/main/resources/application-prod.properties
    sed -i "s|spring.datasource.username=root|spring.datasource.username=$RDS_USERNAME|g" backend/src/main/resources/application-prod.properties
    sed -i "s|spring.datasource.password=password|spring.datasource.password=$RDS_PASSWORD|g" backend/src/main/resources/application-prod.properties
    
    print_status "Backend database configuration updated"
fi

# Update frontend API configuration
if [ -n "$BACKEND_DOMAIN" ]; then
    print_status "Updating frontend API configuration..."
    
    # Create backup of original file
    cp frontend/src/services/api.ts frontend/src/services/api.ts.backup
    
    # Update API base URL
    sed -i "s|const API_BASE_URL = 'http://localhost:8080'|const API_BASE_URL = 'http://$BACKEND_DOMAIN:8080'|g" frontend/src/services/api.ts
    
    print_status "Frontend API configuration updated"
fi

# Step 2: Initialize Git and push to GitHub
print_step "GitHub Repository Setup"

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_status "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - SunYield project"
else
    print_status "Git repository already exists, adding changes..."
    git add .
    git commit -m "Update SunYield project configuration"
fi

# Add or update remote
if git remote get-url origin > /dev/null 2>&1; then
    print_status "Updating existing remote..."
    git remote set-url origin "https://github.com/$GITHUB_USERNAME/$GITHUB_REPO_NAME.git"
else
    print_status "Adding GitHub remote..."
    git remote add origin "https://github.com/$GITHUB_USERNAME/$GITHUB_REPO_NAME.git"
fi

# Force push to replace repository
print_status "Pushing to GitHub (this will replace existing repository content)..."
git branch -M main
git push -f origin main

if [ $? -eq 0 ]; then
    print_status "Successfully pushed to GitHub"
else
    print_error "Failed to push to GitHub"
    exit 1
fi

# Step 3: Deploy to EC2
print_step "EC2 Deployment"

# Create deployment script for EC2
print_status "Creating EC2 deployment script..."

cat > deploy-to-ec2.sh << 'EOF'
#!/bin/bash

# EC2 Deployment Script
echo "🚀 Deploying SunYield to EC2..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Stop existing services
print_status "Stopping existing services..."
sudo systemctl stop sunyield-backend 2>/dev/null || true
sudo systemctl stop nginx 2>/dev/null || true

# Backup existing deployment
print_status "Creating backup of existing deployment..."
sudo cp -r /opt/sunyield /opt/sunyield-backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true
sudo cp -r /var/www/sunyield /var/www/sunyield-backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true

# Remove old files
print_status "Removing old files..."
sudo rm -rf /opt/sunyield
sudo rm -rf /var/www/sunyield

# Clone updated repository
print_status "Cloning updated repository..."
cd /home/ec2-user
git clone https://github.com/REPLACE_GITHUB_USERNAME/REPLACE_GITHUB_REPO_NAME.git sunyield-backend
cd sunyield-backend

# Deploy backend
print_status "Deploying backend..."
if [ -f "deploy-backend.sh" ]; then
    chmod +x deploy-backend.sh
    ./deploy-backend.sh
else
    print_error "deploy-backend.sh not found"
    exit 1
fi

# Deploy frontend
print_status "Deploying frontend..."
if [ -f "deploy-frontend.sh" ]; then
    chmod +x deploy-frontend.sh
    ./deploy-frontend.sh
else
    print_error "deploy-frontend.sh not found"
    exit 1
fi

# Verify deployment
print_status "Verifying deployment..."
sudo systemctl status sunyield-backend
sudo systemctl status nginx

print_status "Deployment completed successfully!"
EOF

# Replace placeholders in deployment script
sed -i "s/REPLACE_GITHUB_USERNAME/$GITHUB_USERNAME/g" deploy-to-ec2.sh
sed -i "s/REPLACE_GITHUB_REPO_NAME/$GITHUB_REPO_NAME/g" deploy-to-ec2.sh

# Make deployment script executable
chmod +x deploy-to-ec2.sh

# Copy deployment script to EC2
print_status "Copying deployment script to EC2..."
scp -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no deploy-to-ec2.sh ec2-user@$EC2_IP:/home/ec2-user/

if [ $? -eq 0 ]; then
    print_status "Deployment script copied successfully"
else
    print_error "Failed to copy deployment script to EC2"
    exit 1
fi

# Execute deployment on EC2
print_status "Executing deployment on EC2..."
ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no ec2-user@$EC2_IP "chmod +x /home/ec2-user/deploy-to-ec2.sh && /home/ec2-user/deploy-to-ec2.sh"

if [ $? -eq 0 ]; then
    print_status "Deployment completed successfully!"
else
    print_error "Deployment failed"
    exit 1
fi

# Step 4: Verification
print_step "Verification"

print_status "Testing backend health..."
ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no ec2-user@$EC2_IP "curl -s http://localhost:8080/actuator/health"

print_status "Testing frontend..."
ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no ec2-user@$EC2_IP "curl -s -I http://localhost:80"

# Cleanup
print_status "Cleaning up temporary files..."
rm -f deploy-to-ec2.sh

print_status "🎉 GitHub replacement and EC2 redeployment completed successfully!"
print_warning "Don't forget to:"
echo "  - Test your application thoroughly"
echo "  - Update DNS records if you have a domain"
echo "  - Configure SSL certificates"
echo "  - Set up monitoring and backups"
echo "  - Update security groups if needed"
