# Complete AWS Deployment Guide for SunYield

## Prerequisites
- AWS Account
- Windows laptop with PuTTY installed
- Basic understanding of terminal commands

## Phase 1: AWS EC2 Setup

### Step 1: Create EC2 Instance
1. **Login to AWS Console**
   - Go to [aws.amazon.com](https://aws.amazon.com)
   - Navigate to EC2 service

2. **Launch Instance**
   - Click "Launch Instance"
   - Name: `sunyield-server`
   - AMI: Amazon Linux 2023 AMI (64-bit x86)
   - Instance type: `t2.micro` (free tier) or `t3.small` (recommended)

3. **Create Key Pair**
   - Key pair name: `sunyield-key`
   - Key pair type: RSA
   - Private key format: `.ppk` (for PuTTY)
   - **Download and save the `.ppk` file safely**

4. **Configure Security Group**
   - Create new security group: `sunyield-sg`
   - Add these inbound rules:
     ```
     Type          Port    Source      Description
     SSH           22      Your IP     SSH access
     HTTP          80      0.0.0.0/0   Frontend access
     Custom TCP    8080    0.0.0.0/0   Backend API
     ```

5. **Launch Instance**
   - Review and launch
   - Wait for instance to be "running"
   - Note down the **Public IPv4 address**

### Step 2: Connect with PuTTY
1. **Open PuTTY**
   - Host Name: `ec2-user@YOUR_PUBLIC_IP` (replace with actual IP)
   - Port: 22
   - Connection type: SSH

2. **Configure Authentication**
   - Go to Connection → SSH → Auth → Credentials
   - Browse and select your `.ppk` file

3. **Save Session**
   - Go back to Session
   - Saved Sessions: "SunYield"
   - Click "Save"
   - Click "Open"

4. **Accept Security Alert**
   - Click "Accept" on the security alert
   - You should see a Linux terminal

## Phase 2: Upload Your Code

### Option A: Using Git (Recommended)
If you have your code on GitHub/GitLab:

```bash
# On your EC2 instance
sudo yum install -y git
git clone https://github.com/yourusername/your-repo.git
cd your-repo
```

### Option B: Using WinSCP (File Transfer)
1. **Download WinSCP** (free SFTP client)
2. **Connect to EC2**:
   - Host name: YOUR_PUBLIC_IP
   - User name: ec2-user
   - Private key: Your `.ppk` file
3. **Upload Files**:
   - Upload your entire project folder to `/home/ec2-user/`

### Option C: Manual Upload (if small files)
1. **Create files on server**:
```bash
mkdir -p ~/sunyield-project
cd ~/sunyield-project
```

2. **Copy-paste your code** into files using nano editor:
```bash
nano filename.java  # Paste your code and save with Ctrl+X, Y, Enter
```

## Phase 3: Deploy Backend

### Step 1: Make Script Executable
```bash
cd ~/sunyield-project  # or wherever your code is
chmod +x deploy-backend-improved.sh
```

### Step 2: Run Backend Deployment
```bash
./deploy-backend-improved.sh
```

**This script will:**
- Install Java 17 and Maven
- Install and configure MySQL database
- Build your Spring Boot application
- Create a system service
- Start the backend automatically

### Step 3: Verify Backend
```bash
# Check if backend is running
sudo systemctl status sunyield-backend

# Check backend health
curl http://localhost:8080/actuator/health

# View logs if there are issues
sudo journalctl -u sunyield-backend -f
```

## Phase 4: Deploy Frontend

### Step 1: Make Script Executable
```bash
chmod +x deploy-frontend-improved.sh
```

### Step 2: Run Frontend Deployment
```bash
./deploy-frontend-improved.sh
```

**This script will:**
- Install Node.js and npm
- Install and configure Nginx
- Build your React application
- Configure proxy to backend
- Start the web server

### Step 3: Verify Frontend
```bash
# Check if nginx is running
sudo systemctl status nginx

# Test frontend access
curl http://localhost
```

## Phase 5: Access Your Application

### Get Your URLs
```bash
# Get your public IP
curl http://checkip.amazonaws.com
```

**Your application URLs:**
- Frontend: `http://YOUR_PUBLIC_IP`
- Backend API: `http://YOUR_PUBLIC_IP:8080`
- Backend Health: `http://YOUR_PUBLIC_IP:8080/actuator/health`

## Phase 6: Initialize Database (If Needed)

If your application needs initial data:

```bash
# Connect to MySQL
mysql -u root -ppassword

# Use your database
USE sunyield;

# Run any initialization SQL files
source /path/to/your/init.sql;
```

## Troubleshooting

### Backend Issues
```bash
# Check backend logs
sudo journalctl -u sunyield-backend -n 50

# Restart backend
sudo systemctl restart sunyield-backend

# Check database connection
mysql -u root -ppassword -e "SHOW DATABASES;"
```

### Frontend Issues
```bash
# Check nginx logs
sudo journalctl -u nginx -n 50

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### Network Issues
```bash
# Check if ports are open
sudo netstat -tlnp | grep :8080  # Backend
sudo netstat -tlnp | grep :80    # Frontend

# Check firewall (shouldn't be an issue on EC2)
sudo iptables -L
```

## Security Notes

1. **Database Security**: The scripts use a simple password for development. For production:
   ```bash
   mysql -u root -p
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_strong_password';
   ```

2. **SSH Key**: Keep your `.ppk` file secure and never share it

3. **Security Groups**: Limit SSH access to your IP only

4. **HTTPS**: For production, set up SSL certificates using Let's Encrypt

## Maintenance Commands

### Start/Stop Services
```bash
# Backend
sudo systemctl start/stop/restart sunyield-backend

# Frontend (nginx)
sudo systemctl start/stop/restart nginx

# Database
sudo systemctl start/stop/restart mysqld
```

### View Logs
```bash
# Backend logs
sudo journalctl -u sunyield-backend -f

# Nginx logs
sudo journalctl -u nginx -f

# System logs
sudo journalctl -f
```

### Update Application
```bash
# Pull latest code (if using git)
cd ~/sunyield-project
git pull

# Rebuild and restart backend
cd backend
mvn clean package -DskipTests
sudo systemctl restart sunyield-backend

# Rebuild and restart frontend
cd ../frontend
npm run build
sudo cp -r build/* /usr/share/nginx/html/
sudo systemctl restart nginx
```

## Success Indicators

✅ **Backend is working** if:
- `curl http://YOUR_IP:8080/actuator/health` returns `{"status":"UP"}`
- `sudo systemctl status sunyield-backend` shows "active (running)"

✅ **Frontend is working** if:
- Visiting `http://YOUR_IP` shows your React application
- `sudo systemctl status nginx` shows "active (running)"

✅ **Full stack is working** if:
- You can access the frontend UI
- Login/registration works (indicates backend connectivity)
- No console errors in browser developer tools

## Getting Help

If you encounter issues:

1. **Check the logs** using the commands above
2. **Verify network connectivity** between frontend and backend
3. **Ensure all services are running** using `systemctl status`
4. **Check security group rules** in AWS console
5. **Verify environment variables** and configuration files

---

**Congratulations!** 🎉 Your SunYield application should now be running on AWS! 