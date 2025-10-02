#!/bin/bash

# SunYield AWS Complete Setup Script
# This script helps you set up the complete AWS infrastructure

echo "🚀 SunYield AWS Infrastructure Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 AWS Setup Checklist:${NC}"
echo "1. ✅ EC2 Instance (Ubuntu 22.04 LTS)"
echo "2. ✅ RDS MySQL Database"
echo "3. ✅ Security Groups"
echo "4. ✅ Domain (Route 53)"
echo "5. ✅ SSL Certificate"
echo ""

echo -e "${YELLOW}🔧 Step 1: EC2 Instance Setup${NC}"
echo "Instance Type: t3.small (recommended) or t2.micro (free tier)"
echo "AMI: Ubuntu Server 22.04 LTS"
echo "Storage: 30 GB gp3"
echo "Security Group: SunYield-Security-Group"
echo ""

echo -e "${YELLOW}🔧 Step 2: RDS Database Setup${NC}"
echo "Engine: MySQL 8.0"
echo "Instance Class: db.t3.micro (free tier)"
echo "Storage: 20 GB"
echo "Security Group: SunYield-RDS-Security-Group"
echo ""

echo -e "${YELLOW}🔧 Step 3: Security Groups Configuration${NC}"
echo "EC2 Security Group (SunYield-Security-Group):"
echo "  - SSH (22) - Your IP"
echo "  - HTTP (80) - 0.0.0.0/0"
echo "  - HTTPS (443) - 0.0.0.0/0"
echo "  - Custom TCP (8080) - 0.0.0.0/0"
echo ""
echo "RDS Security Group (SunYield-RDS-Security-Group):"
echo "  - MySQL (3306) - From EC2 Security Group"
echo ""

echo -e "${YELLOW}🔧 Step 4: Domain Configuration${NC}"
echo "Option A: Register new domain in Route 53"
echo "Option B: Use existing domain with Route 53 hosted zone"
echo ""

echo -e "${GREEN}✅ Next Steps:${NC}"
echo "1. Create EC2 instance with above specifications"
echo "2. Create RDS database with above specifications"
echo "3. Configure security groups as shown"
echo "4. Set up domain in Route 53"
echo "5. Update application-prod.properties with your endpoints"
echo "6. Deploy via PuTTY"
echo ""

echo -e "${BLUE}📝 Important Information to Save:${NC}"
echo "EC2 Public IP: [Save this]"
echo "RDS Endpoint: [Save this]"
echo "Domain: [Save this]"
echo "Database Password: [Save this]"
echo ""

echo -e "${RED}⚠️  Security Notes:${NC}"
echo "- Keep your EC2 key pair safe"
echo "- Use strong database passwords"
echo "- Enable SSL/TLS for production"
echo "- Regular security updates"
echo ""

echo "🎯 Ready to proceed with AWS setup!"
