#!/bin/bash

# 🚀 Quick Redeployment Script for Existing Setup
echo "🚀 Solar Capital Quick Redeployment"
echo "===================================="

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

# Check if running locally (not on EC2)
if curl -s http://169.254.169.254/latest/meta-data/instance-id > /dev/null 2>&1; then
    print_error "This script should be run locally, not on EC2"
    exit 1
fi

# Get GitHub repository details
print_step "GitHub Repository Setup"
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter your GitHub repository name: " GITHUB_REPO_NAME

if [ -z "$GITHUB_USERNAME" ] || [ -z "$GITHUB_REPO_NAME" ]; then
    print_error "GitHub username and repository name are required"
    exit 1
fi

# Get EC2 details
print_step "EC2 Connection Details"
read -p "Enter your EC2 IP address: " EC2_IP
read -p "Enter path to your EC2 key file (.pem): " EC2_KEY_PATH

if [ -z "$EC2_IP" ] || [ -z "$EC2_KEY_PATH" ]; then
    print_error "EC2 IP and key file path are required"
    exit 1
fi

# Check if key file exists
if [ ! -f "$EC2_KEY_PATH" ]; then
    print_error "EC2 key file not found: $EC2_KEY_PATH"
    exit 1
fi

print_status "Configuration validated successfully"

# Step 1: Update configuration files if needed
print_step "Configuration Update"

# Ask if user wants to update RDS configuration
read -p "Do you need to update RDS database configuration? (y/n): " UPDATE_RDS

if [ "$UPDATE_RDS" = "y" ] || [ "$UPDATE_RDS" = "Y" ]; then
    read -p "Enter RDS endpoint: " RDS_ENDPOINT
    read -p "Enter RDS username: " RDS_USERNAME
    read -s -p "Enter RDS password: " RDS_PASSWORD
    echo ""
    
    if [ -n "$RDS_ENDPOINT" ] && [ -n "$RDS_USERNAME" ] && [ -n "$RDS_PASSWORD" ]; then
        print_status "Updating backend database configuration..."
        
        # Create backup
        cp backend/src/main/resources/application-prod.properties backend/src/main/resources/application-prod.properties.backup
        
        # Update database configuration
        sed -i "s|jdbc:mysql://localhost:3306/solarcapital|jdbc:mysql://$RDS_ENDPOINT:3306/solarcapital|g" backend/src/main/resources/application-prod.properties
        sed -i "s|spring.datasource.username=root|spring.datasource.username=$RDS_USERNAME|g" backend/src/main/resources/application-prod.properties
        sed -i "s|spring.datasource.password=password|spring.datasource.password=$RDS_PASSWORD|g" backend/src/main/resources/application-prod.properties
        
        print_status "Database configuration updated"
    fi
fi

# Ask if user wants to update frontend API configuration
read -p "Do you need to update frontend API configuration? (y/n): " UPDATE_FRONTEND

if [ "$UPDATE_FRONTEND" = "y" ] || [ "$UPDATE_FRONTEND" = "Y" ]; then
    read -p "Enter backend domain/IP for frontend API calls: " BACKEND_DOMAIN
    
    if [ -n "$BACKEND_DOMAIN" ]; then
        print_status "Updating frontend API configuration..."
        
        # Create backup
        cp frontend/src/services/api.ts frontend/src/services/api.ts.backup
        
        # Update API base URL
        if grep -q "API_BASE_URL" frontend/src/services/api.ts; then
            sed -i "s|const API_BASE_URL = '.*'|const API_BASE_URL = 'http://$BACKEND_DOMAIN:8080'|g" frontend/src/services/api.ts
        else
            sed -i "1i const API_BASE_URL = 'http://$BACKEND_DOMAIN:8080';" frontend/src/services/api.ts
        fi
        
        print_status "Frontend API configuration updated"
    fi
fi

# Step 2: Git operations
print_step "Git Operations"

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_status "Initializing Git repository..."
    git init
fi

# Add all changes
git add .
git commit -m "Update Solar Capital project - $(date)"

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

if [ $? -ne 0 ]; then
    print_error "Failed to push to GitHub"
    exit 1
fi

print_status "Successfully pushed to GitHub"

# Step 3: Deploy to EC2
print_step "EC2 Deployment"

# Create EC2 deployment script
cat > ec2-quick-deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 Quick Redeployment on EC2..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Stop services
print_status "Stopping services..."
sudo systemctl stop solarcapital-backend
sudo systemctl stop nginx

# Backup current deployment
print_status "Creating backup..."
BACKUP_DIR="/opt/solarcapital-backup-$(date +%Y%m%d-%H%M%S)"
sudo cp -r /opt/solarcapital $BACKUP_DIR 2>/dev/null || true
sudo cp -r /var/www/solarcapital /var/www/solarcapital-backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true

# Navigate to project directory
cd /home/ec2-user/solarcapital-backend

# Pull latest changes
print_status "Pulling latest changes from GitHub..."
git fetch origin
git reset --hard origin/main

# Deploy backend
print_status "Deploying backend..."
if [ -f "deploy-backend.sh" ]; then
    chmod +x deploy-backend.sh
    ./deploy-backend.sh
else
    print_warning "deploy-backend.sh not found, using manual deployment..."
    
    # Manual backend deployment
    cd /opt/solarcapital
    mvn clean package -DskipTests
    
    # Restart backend service
    sudo systemctl daemon-reload
    sudo systemctl start solarcapital-backend
fi

# Deploy frontend
print_status "Deploying frontend..."
if [ -f "deploy-frontend.sh" ]; then
    chmod +x deploy-frontend.sh
    ./deploy-frontend.sh
else
    print_warning "deploy-frontend.sh not found, using manual deployment..."
    
    # Manual frontend deployment
    cd /var/www/solarcapital
    npm install
    npm run build
    sudo cp -r build/* /usr/share/nginx/html/
    
    # Restart nginx
    sudo systemctl start nginx
fi

# Verify deployment
print_status "Verifying deployment..."
sudo systemctl status solarcapital-backend --no-pager
sudo systemctl status nginx --no-pager

print_status "✅ Quick redeployment completed!"
print_warning "If there are issues, you can restore from backup: $BACKUP_DIR"
EOF

# Update placeholders
sed -i "s/REPLACE_GITHUB_USERNAME/$GITHUB_USERNAME/g" ec2-quick-deploy.sh
sed -i "s/REPLACE_GITHUB_REPO_NAME/$GITHUB_REPO_NAME/g" ec2-quick-deploy.sh

chmod +x ec2-quick-deploy.sh

# Copy and execute on EC2
print_status "Copying deployment script to EC2..."
scp -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no ec2-quick-deploy.sh ec2-user@$EC2_IP:/home/ec2-user/

if [ $? -ne 0 ]; then
    print_error "Failed to copy deployment script to EC2"
    exit 1
fi

print_status "Executing deployment on EC2..."
ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no ec2-user@$EC2_IP "chmod +x /home/ec2-user/ec2-quick-deploy.sh && /home/ec2-user/ec2-quick-deploy.sh"

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
rm -f ec2-quick-deploy.sh

print_status "🎉 Quick redeployment completed successfully!"
print_warning "Your application should now be running at:"
echo "  - Backend: http://$EC2_IP:8080"
echo "  - Frontend: http://$EC2_IP"
echo ""
print_warning "Don't forget to:"
echo "  - Test your application thoroughly"
echo "  - Check that all features are working"
echo "  - Monitor logs for any errors"
