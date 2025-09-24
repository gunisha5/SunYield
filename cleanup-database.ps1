# =====================================================
# DATABASE CLEANUP SCRIPT
# =====================================================
# This PowerShell script will help you clean up historical data
# while preserving users and projects
# =====================================================

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "SUNYIELD DATABASE CLEANUP SCRIPT" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Database connection details
$DB_HOST = "localhost"
$DB_PORT = "3306"
$DB_NAME = "sunyield"
$DB_USER = "root"
$DB_PASSWORD = "root"

Write-Host "Database: $DB_NAME on $DB_HOST:$DB_PORT" -ForegroundColor Yellow
Write-Host ""

# Ask user what they want to do
Write-Host "What would you like to do?" -ForegroundColor Green
Write-Host "1. Create backup first, then cleanup" -ForegroundColor White
Write-Host "2. Cleanup directly (no backup)" -ForegroundColor White
Write-Host "3. Just create backup (no cleanup)" -ForegroundColor White
Write-Host "4. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "Creating backup first..." -ForegroundColor Yellow
        mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "source backup_before_cleanup.sql"
        
        Write-Host "Backup completed! Now cleaning up..." -ForegroundColor Yellow
        mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "source cleanup_historical_data.sql"
        
        Write-Host "Cleanup completed!" -ForegroundColor Green
    }
    "2" {
        Write-Host "Cleaning up database (no backup)..." -ForegroundColor Yellow
        mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "source cleanup_historical_data.sql"
        
        Write-Host "Cleanup completed!" -ForegroundColor Green
    }
    "3" {
        Write-Host "Creating backup only..." -ForegroundColor Yellow
        mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "source backup_before_cleanup.sql"
        
        Write-Host "Backup completed!" -ForegroundColor Green
    }
    "4" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit
    }
    default {
        Write-Host "Invalid choice. Exiting..." -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "OPERATION COMPLETED" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Restart your backend application" -ForegroundColor White
Write-Host "2. Test the new credit system with fresh data" -ForegroundColor White
Write-Host "3. Create new subscriptions to test investment-based rewards" -ForegroundColor White
Write-Host ""

