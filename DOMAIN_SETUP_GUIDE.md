# 🌐 Domain Setup Guide for SunYield

## 📋 **What You Need:**
- Your existing domain name
- Your EC2 Public IP address
- Access to your domain registrar

## 🎯 **Step 1: Create Route 53 Hosted Zone**

1. **Go to AWS Console → Route 53**
2. **Click "Hosted Zones"**
3. **Click "Create Hosted Zone"**
4. **Domain Name:** `yourdomain.com` (replace with your actual domain)
5. **Type:** Public hosted zone
6. **Click "Create"**

## 🎯 **Step 2: Get AWS Name Servers**

After creating the hosted zone, you'll see 4 name servers like:
```
ns-123.awsdns-12.com
ns-456.awsdns-23.net
ns-789.awsdns-34.org
ns-012.awsdns-45.co.uk
```

**Copy these name servers!**

## 🎯 **Step 3: Update Domain Registrar**

**Go to your domain registrar and update nameservers:**

### **GoDaddy:**
1. Go to "My Products" → "Domains"
2. Click "Manage" next to your domain
3. Go to "DNS" tab
4. Click "Change Nameservers"
5. Select "Custom"
6. Enter the 4 AWS nameservers
7. Save changes

### **Namecheap:**
1. Go to "Domain List"
2. Click "Manage" next to your domain
3. Go to "Nameservers" section
4. Select "Custom DNS"
5. Enter the 4 AWS nameservers
6. Save changes

### **Google Domains:**
1. Go to "DNS" section
2. Click "Use custom name servers"
3. Enter the 4 AWS nameservers
4. Save changes

## 🎯 **Step 4: Create DNS Records in Route 53**

**A Record (Main Domain):**
1. Click on your domain in hosted zones
2. Click "Create Record"
3. **Record Name:** Leave blank
4. **Record Type:** A
5. **Value:** Your EC2 Public IP
6. **TTL:** 300
7. Click "Create"

**CNAME Record (WWW):**
1. Click "Create Record"
2. **Record Name:** `www`
3. **Record Type:** CNAME
4. **Value:** `yourdomain.com`
5. **TTL:** 300
6. Click "Create"

## 🎯 **Step 5: Update Application Configuration**

**Update `backend/src/main/resources/application-prod.properties`:**

Replace `yourdomain.com` with your actual domain:

```properties
# CORS Configuration
cors.allowed-origins=https://yourdomain.com,http://yourdomain.com,https://www.yourdomain.com,http://www.yourdomain.com
```

**Example:**
```properties
# If your domain is sunyield.com
cors.allowed-origins=https://sunyield.com,http://sunyield.com,https://www.sunyield.com,http://www.sunyield.com
```

## ⏱️ **Timeline:**
- **Nameserver Update:** 5-30 minutes
- **DNS Propagation:** 5-30 minutes
- **Full Availability:** 1-2 hours

## 🧪 **Test Your Domain:**
1. **Wait 10-15 minutes after setup**
2. **Visit your domain:** `http://yourdomain.com`
3. **Test www subdomain:** `http://www.yourdomain.com`
4. **Check if both point to your EC2 IP**

## 🔧 **Troubleshooting:**

**If domain doesn't work:**
1. **Check nameservers are updated** at your registrar
2. **Verify DNS records** in Route 53
3. **Wait for propagation** (can take up to 2 hours)
4. **Test with:** `nslookup yourdomain.com`

## ✅ **Success Indicators:**
- Domain loads your EC2 instance
- Both `yourdomain.com` and `www.yourdomain.com` work
- DNS records show your EC2 IP

**Ready to set up your domain? Let me know your domain name and I'll help you configure it!** 🚀
