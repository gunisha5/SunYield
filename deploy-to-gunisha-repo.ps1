# 🚀 Solar Capital Deployment to gunisha5/SolarCapital (PowerShell)
Write-Host "🚀 Deploying to gunisha5/SolarCapital repository" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Configuration
$GITHUB_USERNAME = "gunisha5"
$GITHUB_REPO_NAME = "SolarCapital"
$EC2_IP = "13.235.242.67"
$PPK_FILE = "C:\Users\HP\Downloads\Solarbackend\s.ppk"

Write-Host "Configuration loaded:" -ForegroundColor Green
Write-Host "  GitHub: $GITHUB_USERNAME/$GITHUB_REPO_NAME" -ForegroundColor White
Write-Host "  EC2 IP: $EC2_IP" -ForegroundColor White
Write-Host "  Key file: $PPK_FILE" -ForegroundColor White

# Check if PPK file exists
if (-not (Test-Path $PPK_FILE)) {
    Write-Host "❌ PPK file not found: $PPK_FILE" -ForegroundColor Red
    Write-Host "Please check the file path and try again." -ForegroundColor Red
    exit 1
}

# Step 1: Update configuration files
Write-Host "`n📝 Updating Configuration Files" -ForegroundColor Blue

# Ask if user wants to update RDS configuration
$UPDATE_RDS = Read-Host "Do you need to update RDS database configuration? (y/n)"

if ($UPDATE_RDS -eq "y" -or $UPDATE_RDS -eq "Y") {
    $RDS_ENDPOINT = Read-Host "Enter RDS endpoint"
    $RDS_USERNAME = Read-Host "Enter RDS username"
    $RDS_PASSWORD = Read-Host "Enter RDS password" -AsSecureString
    $RDS_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($RDS_PASSWORD))
    
    if ($RDS_ENDPOINT -and $RDS_USERNAME -and $RDS_PASSWORD_PLAIN) {
        Write-Host "Updating backend database configuration..." -ForegroundColor Green
        
        # Create backup
        Copy-Item "backend\src\main\resources\application-prod.properties" "backend\src\main\resources\application-prod.properties.backup"
        
        # Update database configuration
        $content = Get-Content "backend\src\main\resources\application-prod.properties" -Raw
        $content = $content -replace "jdbc:mysql://localhost:3306/solarcapital", "jdbc:mysql://$RDS_ENDPOINT:3306/solarcapital"
        $content = $content -replace "spring.datasource.username=root", "spring.datasource.username=$RDS_USERNAME"
        $content = $content -replace "spring.datasource.password=password", "spring.datasource.password=$RDS_PASSWORD_PLAIN"
        Set-Content "backend\src\main\resources\application-prod.properties" $content
        
        Write-Host "Database configuration updated" -ForegroundColor Green
    }
}

# Update frontend API configuration
Write-Host "Updating frontend API configuration..." -ForegroundColor Green
Copy-Item "frontend\src\services\api.ts" "frontend\src\services\api.ts.backup"

# Update API base URL to use EC2 IP
$apiContent = Get-Content "frontend\src\services\api.ts" -Raw
if ($apiContent -match "API_BASE_URL") {
    $apiContent = $apiContent -replace "const API_BASE_URL = '.*'", "const API_BASE_URL = 'http://$EC2_IP:8080'"
} else {
    $apiContent = "const API_BASE_URL = 'http://$EC2_IP:8080';`n" + $apiContent
}
Set-Content "frontend\src\services\api.ts" $apiContent

Write-Host "Frontend API configuration updated" -ForegroundColor Green

# Step 2: Git operations
Write-Host "`n🔧 Git Operations" -ForegroundColor Blue

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Green
    git init
}

# Add all changes
git add .
git commit -m "Update Solar Capital project - $(Get-Date)"

# Add or update remote
try {
    $remoteUrl = git remote get-url origin 2>$null
    if ($remoteUrl) {
        Write-Host "Updating existing remote..." -ForegroundColor Green
        git remote set-url origin "https://github.com/$GITHUB_USERNAME/$GITHUB_REPO_NAME.git"
    } else {
        Write-Host "Adding GitHub remote..." -ForegroundColor Green
        git remote add origin "https://github.com/$GITHUB_USERNAME/$GITHUB_REPO_NAME.git"
    }
} catch {
    Write-Host "Adding GitHub remote..." -ForegroundColor Green
    git remote add origin "https://github.com/$GITHUB_USERNAME/$GITHUB_REPO_NAME.git"
}

# Force push to replace repository
Write-Host "Pushing to GitHub (this will replace existing repository content)..." -ForegroundColor Green
git branch -M main
git push -f origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    exit 1
}

Write-Host "Successfully pushed to GitHub" -ForegroundColor Green

# Step 3: Deploy to EC2
Write-Host "`n🚀 EC2 Deployment" -ForegroundColor Blue

# Create EC2 deployment script
$ec2Script = @"
#!/bin/bash

echo "🚀 Deploying Solar Capital to EC2..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "`${GREEN}[INFO]`${NC} `$1"
}

print_warning() {
    echo -e "`${YELLOW}[WARNING]`${NC} `$1"
}

# Stop services
print_status "Stopping services..."
sudo systemctl stop solarcapital-backend 2>/dev/null || true
sudo systemctl stop nginx 2>/dev/null || true

# Backup current deployment
print_status "Creating backup..."
BACKUP_DIR="/opt/solarcapital-backup-`$(date +%Y%m%d-%H%M%S)"
sudo cp -r /opt/solarcapital `$BACKUP_DIR 2>/dev/null || true
sudo cp -r /var/www/solarcapital /var/www/solarcapital-backup-`$(date +%Y%m%d-%H%M%S) 2>/dev/null || true

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

print_status "✅ Deployment completed!"
print_warning "If there are issues, you can restore from backup: `$BACKUP_DIR"
"@

Set-Content "ec2-deploy.sh" $ec2Script

# Copy and execute on EC2 using PuTTY tools
Write-Host "Copying deployment script to EC2..." -ForegroundColor Green

# Check if PuTTY tools are available
$puttyPath = Get-Command pscp -ErrorAction SilentlyContinue
if (-not $puttyPath) {
    Write-Host "❌ pscp not found. Please install PuTTY or add it to your PATH." -ForegroundColor Red
    Write-Host "Download from: https://www.putty.org/" -ForegroundColor Yellow
    exit 1
}

# Copy script to EC2
pscp -i $PPK_FILE ec2-deploy.sh ec2-user@${EC2_IP}:/home/ec2-user/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to copy deployment script to EC2" -ForegroundColor Red
    exit 1
}

Write-Host "Executing deployment on EC2..." -ForegroundColor Green

# Execute on EC2 using plink
$plinkPath = Get-Command plink -ErrorAction SilentlyContinue
if (-not $plinkPath) {
    Write-Host "❌ plink not found. Please install PuTTY or add it to your PATH." -ForegroundColor Red
    exit 1
}

plink -i $PPK_FILE ec2-user@${EC2_IP} "chmod +x /home/ec2-user/ec2-deploy.sh && /home/ec2-user/ec2-deploy.sh"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed on EC2" -ForegroundColor Red
    exit 1
}

# Verification
Write-Host "`n✅ Verification" -ForegroundColor Blue

Write-Host "Testing backend health..." -ForegroundColor Green
plink -i $PPK_FILE ec2-user@${EC2_IP} "curl -s http://localhost:8080/actuator/health"

Write-Host "Testing frontend..." -ForegroundColor Green
plink -i $PPK_FILE ec2-user@${EC2_IP} "curl -s -I http://localhost:80"

# Cleanup
Remove-Item "ec2-deploy.sh" -ErrorAction SilentlyContinue

Write-Host "`n🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "Your application should now be running at:" -ForegroundColor Yellow
Write-Host "  - Backend: http://$EC2_IP:8080" -ForegroundColor White
Write-Host "  - Frontend: http://$EC2_IP" -ForegroundColor White
Write-Host ""
Write-Host "Don't forget to:" -ForegroundColor Yellow
Write-Host "  - Test your application thoroughly" -ForegroundColor White
Write-Host "  - Check that all features are working" -ForegroundColor White
Write-Host "  - Monitor logs for any errors" -ForegroundColor White
Write-Host "  - Update DNS records if you have a domain" -ForegroundColor White
