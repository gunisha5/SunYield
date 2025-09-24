# SunYield AWS Deployment Setup for Windows
# Run this in PowerShell from your project root directory

Write-Host "🚀 SunYield - Windows Setup for AWS Deployment" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "   Make sure you have 'backend' and 'frontend' folders present" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project structure verified" -ForegroundColor Green

# Create deployment directory
$deployDir = "deployment"
if (-not (Test-Path $deployDir)) {
    New-Item -ItemType Directory -Path $deployDir | Out-Null
}

Write-Host "📋 Copying deployment files..." -ForegroundColor Yellow

# Copy deployment files
Copy-Item "deploy-backend-improved.sh" $deployDir
Copy-Item "deploy-frontend-improved.sh" $deployDir  
Copy-Item "deploy-complete-guide.md" $deployDir

Write-Host "✅ Deployment files prepared" -ForegroundColor Green

# Create archive for easy upload
Write-Host "📦 Creating project archive..." -ForegroundColor Yellow

# Create a zip file with necessary project files
$zipPath = "$deployDir\sunyield-project.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath
}

# Add files to zip (excluding unnecessary folders)
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')

# Function to add directory to zip
function Add-DirectoryToZip($zipFile, $sourceDir, $zipPath) {
    Get-ChildItem $sourceDir -Recurse | Where-Object { 
        $_.FullName -notmatch "node_modules|target|build|\.git" 
    } | ForEach-Object {
        $relativePath = $_.FullName.Substring($sourceDir.Length + 1)
        $zipEntryPath = "$zipPath/$($relativePath.Replace('\', '/'))"
        
        if ($_.PSIsContainer) {
            # Directory
            $null = [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zipFile, $_.FullName, $zipEntryPath + "/")
        } else {
            # File
            $null = [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zipFile, $_.FullName, $zipEntryPath)
        }
    }
}

# Add backend and frontend folders
Add-DirectoryToZip $zip (Resolve-Path "backend").Path "backend"
Add-DirectoryToZip $zip (Resolve-Path "frontend").Path "frontend"

# Add deployment scripts
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, "deploy-backend-improved.sh", "deploy-backend-improved.sh") | Out-Null
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, "deploy-frontend-improved.sh", "deploy-frontend-improved.sh") | Out-Null

# Add SQL files if they exist
Get-ChildItem "*.sql" -ErrorAction SilentlyContinue | ForEach-Object {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $_.Name) | Out-Null
}

$zip.Dispose()

Write-Host "✅ Archive created: $zipPath" -ForegroundColor Green

# Display next steps
Write-Host ""
Write-Host "🎯 Setup Complete! Next Steps:" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 📖 Read the deployment guide:" -ForegroundColor White
Write-Host "   Open: $deployDir\deploy-complete-guide.md" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 🌐 Set up AWS EC2 instance (follow the guide)" -ForegroundColor White
Write-Host ""
Write-Host "3. 📤 Upload project to EC2:" -ForegroundColor White
Write-Host "   - Use WinSCP to upload: $zipPath" -ForegroundColor Gray
Write-Host "   - Or use Git if your code is on GitHub/GitLab" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 🚀 On EC2, extract and run deployment:" -ForegroundColor White
Write-Host "   unzip sunyield-project.zip" -ForegroundColor Gray
Write-Host "   chmod +x *.sh" -ForegroundColor Gray
Write-Host "   ./deploy-backend-improved.sh" -ForegroundColor Gray
Write-Host "   ./deploy-frontend-improved.sh" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 Download required tools:" -ForegroundColor Yellow
Write-Host "   PuTTY: https://www.putty.org/" -ForegroundColor Gray
Write-Host "   WinSCP: https://winscp.net/" -ForegroundColor Gray
Write-Host "   AWS Console: https://aws.amazon.com/console/" -ForegroundColor Gray

# Open deployment guide
$guideFile = "$deployDir\deploy-complete-guide.md"
if (Test-Path $guideFile) {
    Write-Host ""
    Write-Host "📖 Opening deployment guide..." -ForegroundColor Green
    Start-Process $guideFile
} 