#!/bin/bash

# 🚀 Quick Deployment Script for Solar Capital on AWS
echo "🚀 Solar Capital AWS Deployment - Quick Start"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on AWS EC2
if ! curl -s http://169.254.169.254/latest/meta-data/instance-id > /dev/null; then
    print_error "This script should be run on an AWS EC2 instance"
    exit 1
fi

# Get instance metadata
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
INSTANCE_TYPE=$(curl -s http://169.254.169.254/latest/meta-data/instance-type)
REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)

print_status "Deploying on EC2 Instance: $INSTANCE_ID ($INSTANCE_TYPE) in $REGION"

# Detect if this is backend or frontend deployment
if [ "$1" = "backend" ]; then
    print_status "Starting Backend Deployment..."
    
    # Run backend deployment
    if [ -f "deploy-backend.sh" ]; then
        chmod +x deploy-backend.sh
        ./deploy-backend.sh
    else
        print_error "deploy-backend.sh not found"
        exit 1
    fi
    
elif [ "$1" = "frontend" ]; then
    print_status "Starting Frontend Deployment..."
    
    # Run frontend deployment
    if [ -f "deploy-frontend.sh" ]; then
        chmod +x deploy-frontend.sh
        ./deploy-frontend.sh
    else
        print_error "deploy-frontend.sh not found"
        exit 1
    fi
    
else
    print_error "Usage: $0 [backend|frontend]"
    echo ""
    echo "Examples:"
    echo "  $0 backend   # Deploy backend on this EC2 instance"
    echo "  $0 frontend  # Deploy frontend on this EC2 instance"
    echo ""
    echo "Prerequisites:"
    echo "  - Upload your application files to this EC2 instance"
    echo "  - Upload the corresponding deployment script"
    echo "  - Update configuration files with your AWS resources"
    exit 1
fi

print_status "Deployment completed!"
print_warning "Don't forget to:"
echo "  - Update configuration files with your actual AWS resources"
echo "  - Configure security groups and firewall rules"
echo "  - Set up SSL certificates"
echo "  - Configure monitoring and logging"
echo "  - Test the application thoroughly" 