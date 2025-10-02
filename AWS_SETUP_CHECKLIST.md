# ✅ AWS Setup Checklist for SunYield

## 🎯 **Phase 1: AWS Infrastructure Setup**

### **1. EC2 Instance**
- [ ] **Launch EC2 Instance**
  - [ ] Name: `SunYield-Production`
  - [ ] AMI: Ubuntu Server 22.04 LTS
  - [ ] Instance Type: `t3.small` (recommended) or `t2.micro` (free tier)
  - [ ] Key Pair: Create `sunyield-key` (download .pem file)
  - [ ] Storage: 30 GB gp3

- [ ] **Security Group: `SunYield-Security-Group`**
  - [ ] SSH (22) - Your IP
  - [ ] HTTP (80) - 0.0.0.0/0
  - [ ] HTTPS (443) - 0.0.0.0/0
  - [ ] Custom TCP (8080) - 0.0.0.0/0
  - [ ] Custom TCP (3000) - 0.0.0.0/0

- [ ] **Note EC2 Public IP:** `_________________`

### **2. RDS Database**
- [ ] **Create RDS Instance**
  - [ ] Engine: MySQL 8.0
  - [ ] Template: Free tier
  - [ ] DB Instance Identifier: `sunyield-db`
  - [ ] Master Username: `admin`
  - [ ] Master Password: `_________________`
  - [ ] Instance Class: `db.t3.micro`
  - [ ] Storage: 20 GB gp2

- [ ] **RDS Security Group: `SunYield-RDS-Security-Group`**
  - [ ] MySQL (3306) - From EC2 Security Group

- [ ] **Note RDS Endpoint:** `_________________`

### **3. Domain (Optional)**
- [ ] **Register Domain in Route 53**
  - [ ] Domain: `_________________`
  - [ ] Create A Record pointing to EC2 Public IP
  - [ ] Create CNAME for www subdomain

## 🎯 **Phase 2: Configuration Updates**

### **4. Update application-prod.properties**
- [ ] **Replace RDS Endpoint:**
  ```properties
  spring.datasource.url=jdbc:mysql://YOUR_RDS_ENDPOINT:3306/sunyield?useSSL=false&serverTimezone=UTC
  ```

- [ ] **Replace Database Password:**
  ```properties
  spring.datasource.password=YOUR_DATABASE_PASSWORD
  ```

- [ ] **Replace Domain:**
  ```properties
  cors.allowed-origins=https://yourdomain.com,http://yourdomain.com,https://www.yourdomain.com,http://www.yourdomain.com
  ```

## 🎯 **Phase 3: Deployment via PuTTY**

### **5. Connect to EC2**
- [ ] **Convert .pem to .ppk using PuTTYgen**
- [ ] **Connect via PuTTY:**
  - [ ] Host: EC2 Public IP
  - [ ] Port: 22
  - [ ] Load .ppk key file

### **6. Install Dependencies**
- [ ] **Update system:** `sudo apt update && sudo apt upgrade -y`
- [ ] **Install Java 17:** `sudo apt install openjdk-17-jdk -y`
- [ ] **Install Node.js 18:** `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs`
- [ ] **Install Maven:** `sudo apt install maven -y`
- [ ] **Install Nginx:** `sudo apt install nginx -y`
- [ ] **Install MySQL client:** `sudo apt install mysql-client -y`

### **7. Deploy Application**
- [ ] **Clone repository:** `git clone https://github.com/gunisha5/SunYield.git`
- [ ] **Build Backend:** `cd backend && mvn clean package -DskipTests`
- [ ] **Build Frontend:** `cd ../frontend && npm install && npm run build`
- [ ] **Configure Nginx** (use provided config)
- [ ] **Create systemd service** (use provided config)
- [ ] **Initialize database** (connect to RDS and create database)

### **8. SSL Certificate (Optional)**
- [ ] **Install Certbot:** `sudo apt install certbot python3-certbot-nginx -y`
- [ ] **Get SSL Certificate:** `sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com`

## 🎯 **Phase 4: Verification**

### **9. Test Application**
- [ ] **Check backend service:** `sudo systemctl status sunyield-backend`
- [ ] **Check Nginx:** `sudo systemctl status nginx`
- [ ] **Visit domain:** `https://yourdomain.com`
- [ ] **Test API:** `https://yourdomain.com/api/health`
- [ ] **Check database connection**

### **10. Final Checks**
- [ ] **All services running**
- [ ] **Domain accessible**
- [ ] **Database connected**
- [ ] **SSL working (if configured)**
- [ ] **Application fully functional**

## 📝 **Important Information to Save**

| Item | Value |
|------|-------|
| EC2 Public IP | `_________________` |
| RDS Endpoint | `_________________` |
| Database Password | `_________________` |
| Domain | `_________________` |
| Key Pair File | `sunyield-key.pem` |

## 🚨 **Security Reminders**

- [ ] Keep EC2 key pair safe
- [ ] Use strong database passwords
- [ ] Enable SSL/TLS for production
- [ ] Regular security updates
- [ ] Monitor logs for errors

## 🎉 **Success Criteria**

Your SunYield application is successfully deployed when:
- ✅ Frontend loads at your domain
- ✅ Backend API responds correctly
- ✅ Database connection works
- ✅ All services are running
- ✅ SSL certificate is active (if configured)

**Ready to start? Begin with Phase 1! 🚀**
