# GitHub Setup Guide for SunYield Project

This guide will help you upload your SunYield project to GitHub and then deploy it on AWS.

## Step 1: Prepare Your Project for GitHub

### 1.1 Create .gitignore File

Create a `.gitignore` file in your project root:

```gitignore
# Compiled class file
*.class

# Log file
*.log

# BlueJ files
*.ctxt

# Mobile Tools for Java (J2ME)
.mtj.tmp/

# Package Files #
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar

# virtual machine crash logs
hs_err_pid*
replay_pid*

# Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties
dependency-reduced-pom.xml
buildNumber.properties
.mvn/timing.properties
.mvn/wrapper/maven-wrapper.jar

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# React build
frontend/build/
frontend/dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Database
*.db
*.sqlite
*.sqlite3

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# AWS
.aws/

# Backup files
*.bak
*.backup
*.sql

# Uploads (if you want to exclude user uploads)
uploads/
```

### 1.2 Create README.md

Create a comprehensive README.md:

```markdown
# SunYield - Solar Investment Platform

A comprehensive solar energy investment platform built with React and Spring Boot.

## Features

- 🌞 Solar Project Investment
- 💰 Energy Rewards System
- 📊 Portfolio Management
- 💳 Wallet System
- 🎁 Gift & Donation System
- 📈 Earnings Tracking
- 🔐 KYC Verification
- 👨‍💼 Admin Dashboard

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- React Router
- React Hot Toast
- Lucide React Icons

### Backend
- Spring Boot 3.x
- Spring Security
- Spring Data JPA
- MySQL Database
- Maven
- Java 17

## Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.6+

## Local Development Setup

### Backend Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/sunyield.git
cd sunyield/backend
```

2. Configure database
```bash
# Create database
mysql -u root -p
CREATE DATABASE sunyield;
```

3. Update application.properties
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sunyield
spring.datasource.username=root
spring.datasource.password=yourpassword
```

4. Run the application
```bash
./mvnw spring-boot:run
```

### Frontend Setup

1. Navigate to frontend directory
```bash
cd ../frontend
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/{id}` - Get project by ID

### Subscriptions
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions/history` - Get subscription history

### Wallet
- `GET /api/wallet` - Get wallet details
- `POST /api/wallet/add-funds` - Add funds to wallet

## Database Schema

The application uses the following main entities:
- Users
- Projects
- Subscriptions
- RewardHistory
- CreditTransferLog
- KYC
- Coupons

## Deployment

See [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
```

## Step 2: Initialize Git Repository

### 2.1 Initialize Git in Your Project

```bash
# Navigate to your project root
cd Solarbackend

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: SunYield solar investment platform"
```

### 2.2 Create GitHub Repository

1. **Go to GitHub**
   - Visit [github.com](https://github.com)
   - Click "New repository"

2. **Repository Settings**
   ```
   Repository name: sunyield
   Description: Solar investment platform built with React and Spring Boot
   Visibility: Public (or Private)
   Initialize: Don't initialize (we already have files)
   ```

3. **Get Repository URL**
   - Copy the repository URL (e.g., `https://github.com/yourusername/sunyield.git`)

### 2.3 Connect Local Repository to GitHub

```bash
# Add remote origin
git remote add origin https://github.com/yourusername/sunyield.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Database Migration Strategy

### 3.1 Current Database vs New Database

**You have two options:**

#### Option A: Use Your Current Database (Recommended for Development)
- Export your current database
- Import it into AWS RDS
- Keep all existing data

#### Option B: Create Fresh Database (Recommended for Production)
- Start with empty database
- Let Spring Boot create tables automatically
- No existing data

### 3.2 Export Current Database (Option A)

```bash
# Export your current database
mysqldump -u root -p sunyield > sunyield_backup.sql

# This will create a backup file with all your data
```

### 3.3 Import to AWS RDS (Option A)

```bash
# After setting up AWS RDS, import your data
mysql -h YOUR_RDS_ENDPOINT -u admin -p sunyield < sunyield_backup.sql
```

## Step 4: Update Configuration for Production

### 4.1 Create Production Properties

Create `backend/src/main/resources/application-prod.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?useSSL=false&serverTimezone=UTC
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Server Configuration
server.port=8080
server.servlet.context-path=/api

# CORS Configuration
cors.allowed-origins=https://yourdomain.com,http://yourdomain.com
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
cors.allowed-headers=*
cors.allow-credentials=true

# Email Configuration (if using)
spring.mail.host=${EMAIL_HOST}
spring.mail.port=${EMAIL_PORT}
spring.mail.username=${EMAIL_USERNAME}
spring.mail.password=${EMAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### 4.2 Update Frontend API Configuration

Update `frontend/src/services/api.ts`:

```typescript
// Update the base URL for production
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://yourdomain.com/api' 
  : 'http://localhost:8080/api';

// Update the api instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## Step 5: GitHub Actions for CI/CD (Optional)

### 5.1 Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Build Backend
      run: |
        cd backend
        ./mvnw clean package -DskipTests
    
    - name: Build Frontend
      run: |
        cd frontend
        npm ci
        npm run build
    
    - name: Deploy to AWS
      run: |
        # Add your deployment commands here
        echo "Deploying to AWS..."
```

## Step 6: Environment Variables Setup

### 6.1 Create Environment File Template

Create `.env.example`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sunyield
DB_USER=root
DB_PASSWORD=yourpassword

# Application Configuration
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 6.2 Update .gitignore

Make sure `.env` is in your `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

## Step 7: Commit and Push Changes

```bash
# Add all changes
git add .

# Commit changes
git commit -m "Add production configuration and deployment setup"

# Push to GitHub
git push origin main
```

## Step 8: Deploy to AWS

Now follow the [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) to deploy your project to AWS.

### Quick Deployment Steps:

1. **Set up AWS RDS MySQL**
2. **Launch EC2 instance**
3. **Clone your GitHub repository on EC2**
4. **Configure environment variables**
5. **Deploy backend and frontend**
6. **Set up domain and SSL**

## Database Migration Options

### Option 1: Fresh Start (Recommended)
- Start with empty database
- Let Spring Boot create tables
- No data migration needed
- Clean production environment

### Option 2: Migrate Existing Data
- Export current database
- Import to AWS RDS
- Keep all existing data
- More complex but preserves data

## Next Steps

1. ✅ Upload to GitHub
2. ✅ Set up production configuration
3. 🔄 Deploy to AWS (follow AWS guide)
4. 🔄 Set up domain and SSL
5. 🔄 Configure monitoring and backups

Your project is now ready for GitHub and AWS deployment!
