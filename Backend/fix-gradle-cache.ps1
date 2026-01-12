# PowerShell script to fix Gradle cache lock issue
# Run this script after closing your IDE and any Java processes

Write-Host "Attempting to fix Gradle cache lock issue..." -ForegroundColor Yellow

# Stop any running Java/Gradle processes
Write-Host "Stopping Java processes..." -ForegroundColor Cyan
Get-Process | Where-Object {$_.ProcessName -like "*java*" -or $_.ProcessName -like "*gradle*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Delete the problematic Gradle cache directory
$gradleCachePath = "$env:USERPROFILE\.gradle\wrapper\dists\gradle-8.14.3-bin\cv11ve7ro1n3o1j4so8xd9n66"
$gradleCacheParentPath = "$env:USERPROFILE\.gradle\wrapper\dists\gradle-8.14.3-bin"

Write-Host "Attempting to delete Gradle cache directory..." -ForegroundColor Cyan

if (Test-Path $gradleCachePath) {
    try {
        Remove-Item -Path $gradleCachePath -Recurse -Force -ErrorAction Stop
        Write-Host "Successfully deleted the Gradle cache directory!" -ForegroundColor Green
    }
    catch {
        Write-Host "Error: Could not delete the directory. It may be locked by another process." -ForegroundColor Red
        Write-Host "Please:" -ForegroundColor Yellow
        Write-Host "1. Close your IDE (IntelliJ IDEA, Eclipse, VS Code, etc.)" -ForegroundColor Yellow
        Write-Host "2. Close any Java processes in Task Manager" -ForegroundColor Yellow
        Write-Host "3. Run this script again" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Alternative: Manually delete this directory:" -ForegroundColor Yellow
        Write-Host $gradleCachePath -ForegroundColor Cyan
        exit 1
    }
}
else {
    Write-Host "Cache directory not found (may have already been deleted)." -ForegroundColor Green
}

# Alternative: Delete the entire gradle-8.14.3-bin directory
if (Test-Path $gradleCacheParentPath) {
    try {
        Remove-Item -Path $gradleCacheParentPath -Recurse -Force -ErrorAction Stop
        Write-Host "Successfully deleted the entire Gradle 8.14.3 cache!" -ForegroundColor Green
    }
    catch {
        Write-Host "Warning: Could not delete parent directory (this is okay if specific directory was deleted)." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Done! You can now run your Gradle build again." -ForegroundColor Green
Write-Host "The Gradle wrapper will automatically re-download the distribution if needed." -ForegroundColor Green
