@echo off
echo ========================================
echo Solar Capital Backend Restart Script
echo ========================================

echo.
echo Stopping any running backend processes...
taskkill /f /im java.exe 2>nul
timeout /t 3 /nobreak >nul

echo.
echo Checking if Maven is available...
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Maven not found in PATH. Trying alternative methods...
    echo.
    echo Method 1: Try using the Maven wrapper...
    if exist "backend\mvnw.cmd" (
        echo Using Maven wrapper...
        cd backend
        mvnw.cmd spring-boot:run
    ) else (
        echo Maven wrapper not found. Please ensure Maven is installed.
        echo.
        echo Method 2: Try using full Maven path...
        echo Please install Maven or add it to your PATH.
        pause
        exit /b 1
    )
) else (
    echo Maven found. Starting backend server...
    cd backend
    mvn spring-boot:run
)

echo.
echo Backend server should now be running on http://localhost:8080
echo Press Ctrl+C to stop the server
pause 