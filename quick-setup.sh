#!/bin/bash

# Quick Setup Script - Prepares deployment files
echo "🚀 SunYield - Quick Setup for AWS Deployment"
echo "================================================="

# Create deployment directory if it doesn't exist
DEPLOY_DIR="deployment"
mkdir -p $DEPLOY_DIR

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Make sure you have 'backend' and 'frontend' folders present"
    exit 1
fi

echo "✅ Project structure verified"

# Copy deployment scripts to deployment folder
echo "📋 Copying deployment scripts..."
cp deploy-backend-improved.sh $DEPLOY_DIR/
cp deploy-frontend-improved.sh $DEPLOY_DIR/
cp deploy-complete-guide.md $DEPLOY_DIR/

# Make scripts executable
chmod +x $DEPLOY_DIR/deploy-backend-improved.sh
chmod +x $DEPLOY_DIR/deploy-frontend-improved.sh

echo "✅ Deployment scripts prepared"

# Create a simple project archiver script
cat > $DEPLOY_DIR/create-project-archive.sh << 'EOF'
#!/bin/bash
echo "📦 Creating project archive for upload..."

# Create archive excluding unnecessary files
tar -czf sunyield-project.tar.gz \
    --exclude='node_modules' \
    --exclude='target' \
    --exclude='build' \
    --exclude='.git' \
    --exclude='*.log' \
    backend/ frontend/ \
    deploy-backend-improved.sh \
    deploy-frontend-improved.sh \
    *.sql

echo "✅ Archive created: sunyield-project.tar.gz"
echo "📤 Upload this file to your EC2 instance and extract with:"
echo "   tar -xzf sunyield-project.tar.gz"
EOF

chmod +x $DEPLOY_DIR/create-project-archive.sh

# Display next steps
echo ""
echo "🎯 Setup Complete! Next Steps:"
echo "================================"
echo ""
echo "1. 📖 Read the complete guide:"
echo "   cat $DEPLOY_DIR/deploy-complete-guide.md"
echo ""
echo "2. 📦 Create project archive (if uploading via WinSCP):"
echo "   cd $DEPLOY_DIR && ./create-project-archive.sh"
echo ""
echo "3. 🚀 On your EC2 instance, run these in order:"
echo "   ./deploy-backend-improved.sh"
echo "   ./deploy-frontend-improved.sh"
echo ""
echo "📁 All deployment files are in the '$DEPLOY_DIR' folder"
echo ""
echo "🔗 Quick links for AWS setup:"
echo "   AWS Console: https://aws.amazon.com/console/"
echo "   PuTTY Download: https://www.putty.org/"
echo "   WinSCP Download: https://winscp.net/" 