@echo off
echo Attempting to fix Gradle cache lock issue...
echo.

REM Stop Java processes
echo Stopping Java processes...
taskkill /F /IM java.exe /T 2>nul
taskkill /F /IM javaw.exe /T 2>nul
taskkill /F /IM gradle.exe /T 2>nul
timeout /t 2 /nobreak >nul

REM Delete the problematic directory
set GRADLE_CACHE=%USERPROFILE%\.gradle\wrapper\dists\gradle-8.14.3-bin\cv11ve7ro1n3o1j4so8xd9n66
set GRADLE_PARENT=%USERPROFILE%\.gradle\wrapper\dists\gradle-8.14.3-bin

echo Attempting to delete Gradle cache directory...

if exist "%GRADLE_CACHE%" (
    rmdir /s /q "%GRADLE_CACHE%" 2>nul
    if errorlevel 1 (
        echo.
        echo ERROR: Could not delete the directory. It may be locked by another process.
        echo.
        echo Please:
        echo 1. Close your IDE (IntelliJ IDEA, Eclipse, VS Code, etc.)
        echo 2. Close any Java processes in Task Manager
        echo 3. Run this script again
        echo.
        echo Alternative: Manually delete this directory:
        echo %GRADLE_CACHE%
        pause
        exit /b 1
    ) else (
        echo Successfully deleted the Gradle cache directory!
    )
) else (
    echo Cache directory not found (may have already been deleted).
)

REM Try to delete parent directory
if exist "%GRADLE_PARENT%" (
    rmdir /s /q "%GRADLE_PARENT%" 2>nul
)

echo.
echo Done! You can now run your Gradle build again.
echo The Gradle wrapper will automatically re-download the distribution if needed.
echo.
pause
