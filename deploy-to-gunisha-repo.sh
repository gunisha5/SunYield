#!/bin/bash

# 🚀 SunYield Deployment to gunisha5/sunyield
echo "🚀 Deploying to gunisha5/sunyield repository"
echo "================================================"

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

# Configuration
GITHUB_USERNAME="gunisha5"
GITHUB_REPO_NAME="sunyield"
EC2_IP="13.235.242.67"
PPK_FILE="C:\\Users\\HP\\Downloads\\Solarbackend\\s.ppk"

print_status "Configuration loaded:"
echo "  GitHub: $GITHUB_USERNAME/$GITHUB_REPO_NAME"
echo "  EC2 IP: $EC2_IP"
echo "  Key file: $PPK_FILE"

# Check if PPK file exists
if [ ! -f "$PPK_FILE" ]; then
    print_error "PPK file not found: $PPK_FILE"
    echo "Please check the file path and try again."
    exit 1
fi

# Convert PPK to PEM if needed (for OpenSSH compatibility)
print_step "Preparing SSH key"
PEM_FILE="./temp_key.pem"

# Try to convert PPK to PEM using puttygen if available
if command -v puttygen >/dev/null 2>&1; then
    print_status "Converting PPK to PEM format..."
    puttygen "$PPK_FILE" -O private-openssh -o "$PEM_FILE"
    chmod 600 "$PEM_FILE"
    SSH_KEY="$PEM_FILE"
else
    print_warning "puttygen not found. Using PPK file directly with plink/pscp."
    SSH_KEY="$PPK_FILE"
fi

# Step 1: Update configuration files
print_step "Updating Configuration Files"

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
        sed -i "s|jdbc:mysql://localhost:3306/sunyield|jdbc:mysql://$RDS_ENDPOINT:3306/sunyield|g" backend/src/main/resources/application-prod.properties
        sed -i "s|spring.datasource.username=root|spring.datasource.username=$RDS_USERNAME|g" backend/src/main/resources/application-prod.properties
        sed -i "s|spring.datasource.password=password|spring.datasource.password=$RDS_PASSWORD|g" backend/src/main/resources/application-prod.properties
        
        print_status "Database configuration updated"
    fi
fi

# Update frontend API configuration
print_status "Updating frontend API configuration..."
cp frontend/src/services/api.ts frontend/src/services/api.ts.backup

# Update API base URL to use EC2 IP
if grep -q "API_BASE_URL" frontend/src/services/api.ts; then
    sed -i "s|const API_BASE_URL = '.*'|const API_BASE_URL = 'http://$EC2_IP:8080'|g" frontend/src/services/api.ts
else
    sed -i "1i const API_BASE_URL = 'http://$EC2_IP:8080';" frontend/src/services/api.ts
fi

print_status "Frontend API configuration updated"

# Step 2: Git operations
print_step "Git Operations"

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_status "Initializing Git repository..."
    git init
fi

# Add all changes
git add .
git commit -m "Update SunYield project - $(date)"

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
cat > ec2-deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying SunYield to EC2..."

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
sudo systemctl stop sunyield-backend 2>/dev/null || true
sudo systemctl stop nginx 2>/dev/null || true

# Backup current deployment
print_status "Creating backup..."
BACKUP_DIR="/opt/sunyield-backup-$(date +%Y%m%d-%H%M%S)"
sudo cp -r /opt/sunyield $BACKUP_DIR 2>/dev/null || true
sudo cp -r /var/www/sunyield /var/www/sunyield-backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true

# Navigate to project directory
cd /home/ec2-user/sunyield-backend

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
    cd /opt/sunyield
    mvn clean package -DskipTests
    
    # Restart backend service
    sudo systemctl daemon-reload
    sudo systemctl start sunyield-backend
fi

# Deploy frontend
print_status "Deploying frontend..."
if [ -f "deploy-frontend.sh" ]; then
    chmod +x deploy-frontend.sh
    ./deploy-frontend.sh
else
    print_warning "deploy-frontend.sh not found, using manual deployment..."
    
    # Manual frontend deployment
    cd /var/www/sunyield
    npm install
    npm run build
    sudo cp -r build/* /usr/share/nginx/html/
    
    # Restart nginx
    sudo systemctl start nginx
fi

# Verify deployment
print_status "Verifying deployment..."
sudo systemctl status sunyield-backend --no-pager
sudo systemctl status nginx --no-pager

print_status "✅ Deployment completed!"
print_warning "If there are issues, you can restore from backup: $BACKUP_DIR"
EOF

chmod +x ec2-deploy.sh

# Copy and execute on EC2
print_status "Copying deployment script to EC2..."

# Use scp with the appropriate key format
if [ "$SSH_KEY" = "$PEM_FILE" ]; then
    # Using PEM format
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no ec2-deploy.sh ec2-user@$EC2_IP:/home/ec2-user/
else
    # Using PPK format with pscp (PuTTY)
    if command -v pscp >/dev/null 2>&1; then
        pscp -i "$SSH_KEY" ec2-deploy.sh ec2-user@$EC2_IP:/home/ec2-user/
    else
        print_error "pscp not found. Please install PuTTY or convert your key to PEM format."
        exit 1
    fi
fi

if [ $? -ne 0 ]; then
    print_error "Failed to copy deployment script to EC2"
    exit 1
fi

print_status "Executing deployment on EC2..."

# Execute on EC2 with appropriate SSH command
if [ "$SSH_KEY" = "$PEM_FILE" ]; then
    # Using PEM format
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ec2-user@$EC2_IP "chmod +x /home/ec2-user/ec2-deploy.sh && /home/ec2-user/ec2-deploy.sh"
else
    # Using PPK format with plink (PuTTY)
    if command -v plink >/dev/null 2>&1; then
        plink -i "$SSH_KEY" ec2-user@$EC2_IP "chmod +x /home/ec2-user/ec2-deploy.sh && /home/ec2-user/ec2-deploy.sh"
    else
        print_error "plink not found. Please install PuTTY or convert your key to PEM format."
        exit 1
    fi
fi

if [ $? -ne 0 ]; then
    print_error "Deployment failed on EC2"
    exit 1
fi

# Verification
print_step "Verification"

print_status "Testing backend health..."
if [ "$SSH_KEY" = "$PEM_FILE" ]; then
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ec2-user@$EC2_IP "curl -s http://localhost:8080/actuator/health"
else
    plink -i "$SSH_KEY" ec2-user@$EC2_IP "curl -s http://localhost:8080/actuator/health"
fi

print_status "Testing frontend..."
if [ "$SSH_KEY" = "$PEM_FILE" ]; then
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ec2-user@$EC2_IP "curl -s -I http://localhost:80"
else
    plink -i "$SSH_KEY" ec2-user@$EC2_IP "curl -s -I http://localhost:80"
fi

# Cleanup
rm -f ec2-deploy.sh
if [ -f "$PEM_FILE" ]; then
    rm -f "$PEM_FILE"
fi

print_status "🎉 Deployment completed successfully!"
print_warning "Your application should now be running at:"
echo "  - Backend: http://$EC2_IP:8080"
echo "  - Frontend: http://$EC2_IP"
echo ""
print_warning "Don't forget to:"
echo "  - Test your application thoroughly"
echo "  - Check that all features are working"
echo "  - Monitor logs for any errors"
echo "  - Update DNS records if you have a domain"
