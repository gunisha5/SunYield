# Simple Redeployment Steps (Existing Setup)

Since you already have your GitHub repository and EC2 instance configured, here's the simplest way to redeploy:

## Option 1: Automated Script (Recommended)
```bash
./quick-redeploy.sh
```

## Option 2: Manual Steps

### Step 1: Replace GitHub Repository
```bash
# Initialize git (if not already done)
git init

# Add all your new project files
git add .

# Commit changes
git commit -m "Update SunYield project"

# Add your GitHub remote (replace with your details)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Force push to replace repository
git branch -M main
git push -f origin main
```

### Step 2: Update Configuration (if needed)
If your RDS endpoint or other configurations have changed:

**Backend Database Configuration:**
Edit `backend/src/main/resources/application-prod.properties`:
```properties
spring.datasource.url=jdbc:mysql://YOUR_RDS_ENDPOINT:3306/sunyield?allowPublicKeyRetrieval=true&useSSL=false
spring.datasource.username=YOUR_RDS_USERNAME
spring.datasource.password=YOUR_RDS_PASSWORD
```

**Frontend API Configuration:**
Edit `frontend/src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://YOUR_EC2_IP:8080';
```

### Step 3: Deploy to EC2
SSH into your EC2 instance:
```bash
ssh -i your-key.pem ec2-user@YOUR_EC2_IP
```

Then run these commands on EC2:
```bash
# Stop services
sudo systemctl stop sunyield-backend
sudo systemctl stop nginx

# Navigate to your project directory
cd /home/ec2-user/sunyield-backend

# Pull latest changes
git fetch origin
git reset --hard origin/main

# Deploy backend
chmod +x deploy-backend.sh
./deploy-backend.sh

# Deploy frontend
chmod +x deploy-frontend.sh
./deploy-frontend.sh

# Check status
sudo systemctl status sunyield-backend
sudo systemctl status nginx
```

### Step 4: Test Your Application
- Backend: `http://YOUR_EC2_IP:8080`
- Frontend: `http://YOUR_EC2_IP`

## What This Does:
1. ✅ Replaces your GitHub repository with the new project
2. ✅ Pulls the new code on your EC2 instance
3. ✅ Rebuilds and restarts your services
4. ✅ Maintains connection to your existing RDS database
5. ✅ Preserves your existing data

## Troubleshooting:
If something goes wrong:
```bash
# On EC2, check logs
sudo journalctl -u sunyield-backend -f
sudo journalctl -u nginx -f

# Restart services if needed
sudo systemctl restart sunyield-backend
sudo systemctl restart nginx
```

That's it! Your application should be running with the new code while maintaining all your existing data and configurations.
