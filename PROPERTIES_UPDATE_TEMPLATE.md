# 🔧 Application Properties Update Template

## 📋 **Information You Need to Collect**

### **1. EC2 Instance Information**
- **EC2 Public IP Address:** `_________________`
- **EC2 Instance ID:** `i-0a3a9cc40e7339a3e` ✅ (already have)

### **2. RDS Database Information**
- **RDS Endpoint:** `_________________`
- **Database Name:** `sunyield` (default)
- **Master Username:** `admin` (default)
- **Master Password:** `_________________`

### **3. Domain Information**
- **Your Domain:** `_________________`
- **WWW Subdomain:** `www._________________`

## 🔍 **How to Find This Information**

### **EC2 Public IP:**
1. Go to **AWS Console** → **EC2** → **Instances**
2. Click on **"SunYield-Production"**
3. Look for **"Public IPv4 address"**
4. Copy the IP address

### **RDS Endpoint:**
1. Go to **AWS Console** → **RDS** → **Databases**
2. Click on **"sunyield-db"**
3. Look for **"Endpoint"** (copy the full URL)
4. Example: `sunyield-db.xxxxx.us-east-1.rds.amazonaws.com`

### **Domain:**
- Use the domain you already purchased

## 🔧 **Update Your Properties File**

**File to update:** `backend/src/main/resources/application-prod.properties`

### **Lines to Update:**

**Line 6 - Database URL:**
```properties
# Replace YOUR_RDS_ENDPOINT with your actual RDS endpoint
spring.datasource.url=jdbc:mysql://YOUR_RDS_ENDPOINT:3306/sunyield?useSSL=false&serverTimezone=UTC
```

**Line 8 - Database Password:**
```properties
# Replace YOUR_DATABASE_PASSWORD with your actual password
spring.datasource.password=YOUR_DATABASE_PASSWORD
```

**Line 31 - CORS Configuration:**
```properties
# Replace yourdomain.com with your actual domain
cors.allowed-origins=https://yourdomain.com,http://yourdomain.com,https://www.yourdomain.com,http://www.yourdomain.com
```

## 📝 **Example with Real Values**

**If your domain is `sunyield.com` and RDS endpoint is `sunyield-db.abc123.us-east-1.rds.amazonaws.com`:**

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://sunyield-db.abc123.us-east-1.rds.amazonaws.com:3306/sunyield?useSSL=false&serverTimezone=UTC
spring.datasource.username=admin
spring.datasource.password=YourStrongPassword123

# CORS Configuration
cors.allowed-origins=https://sunyield.com,http://sunyield.com,https://www.sunyield.com,http://www.sunyield.com
```

## ✅ **Checklist**

- [ ] **EC2 Public IP collected**
- [ ] **RDS Endpoint collected**
- [ ] **Database password collected**
- [ ] **Domain name collected**
- [ ] **Properties file updated**
- [ ] **Test connection to database**

## 🚀 **Next Steps After Update**

1. **Save the properties file**
2. **Commit changes to Git**
3. **Push to GitHub**
4. **Deploy to EC2 via PuTTY**

## 🔧 **Quick Update Commands**

**After collecting your information, update these lines:**

```bash
# Update database URL
sed -i 's/YOUR_RDS_ENDPOINT/your-actual-rds-endpoint/g' backend/src/main/resources/application-prod.properties

# Update database password
sed -i 's/YOUR_DATABASE_PASSWORD/your-actual-password/g' backend/src/main/resources/application-prod.properties

# Update domain
sed -i 's/yourdomain.com/your-actual-domain.com/g' backend/src/main/resources/application-prod.properties
```

**Ready to collect your information and update the properties?** 🎯
