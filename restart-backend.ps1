Write-Host "========================================" -ForegroundColor Green
Write-Host "Solar Capital Backend Restart Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host ""
Write-Host "Stopping any running backend processes..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Checking if Maven is available..." -ForegroundColor Yellow
try {
    mvn -version | Out-Null
    Write-Host "Maven found. Starting backend server..." -ForegroundColor Green
    Set-Location backend
    mvn spring-boot:run
} catch {
    Write-Host "Maven not found in PATH. Trying alternative methods..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Method 1: Try using the Maven wrapper..." -ForegroundColor Cyan
    
    if (Test-Path "backend\mvnw.cmd") {
        Write-Host "Using Maven wrapper..." -ForegroundColor Green
        Set-Location backend
        .\mvnw.cmd spring-boot:run
    } else {
        Write-Host "Maven wrapper not found. Please ensure Maven is installed." -ForegroundColor Red
        Write-Host ""
        Write-Host "Method 2: Try using full Maven path..." -ForegroundColor Cyan
        Write-Host "Please install Maven or add it to your PATH." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "Backend server should now be running on http://localhost:8080" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Read-Host "Press Enter to exit" 