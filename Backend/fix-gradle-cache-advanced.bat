@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Gradle Cache Lock Fixer (Advanced)
echo ========================================
echo.

set GRADLE_CACHE=%USERPROFILE%\.gradle\wrapper\dists\gradle-8.14.3-bin
set GRADLE_SPECIFIC=%GRADLE_CACHE%\cv11ve7ro1n3o1j4so8xd9n66

echo Step 1: Stopping Java/Gradle processes...
taskkill /F /IM java.exe /T >nul 2>&1
taskkill /F /IM javaw.exe /T >nul 2>&1
taskkill /F /IM gradle.exe /T >nul 2>&1
taskkill /F /IM idea64.exe /T >nul 2>&1
taskkill /F /IM idea.exe /T >nul 2>&1
taskkill /F /IM eclipse.exe /T >nul 2>&1
echo Waiting for processes to terminate...
timeout /t 3 /nobreak >nul

echo.
echo Step 2: Checking if cache directory exists...
if not exist "%GRADLE_CACHE%" (
    echo Cache directory does not exist. It may have already been deleted.
    echo.
    goto :success
)

echo Found: %GRADLE_CACHE%
echo.

echo Step 3: Attempting Method 1 - Standard deletion...
if exist "%GRADLE_CACHE%" (
    rmdir /s /q "%GRADLE_CACHE%" 2>nul
    if not exist "%GRADLE_CACHE%" (
        echo SUCCESS: Directory deleted using standard method!
        goto :success
    )
    echo Method 1 failed - directory still locked.
)

echo.
echo Step 4: Attempting Method 2 - Take ownership then delete...
takeown /F "%GRADLE_CACHE%" /R /D Y >nul 2>&1
icacls "%GRADLE_CACHE%" /grant %USERNAME%:F /T >nul 2>&1
timeout /t 1 /nobreak >nul
rmdir /s /q "%GRADLE_CACHE%" 2>nul
if not exist "%GRADLE_CACHE%" (
    echo SUCCESS: Directory deleted after taking ownership!
    goto :success
)
echo Method 2 failed.

echo.
echo Step 5: Attempting Method 3 - Robocopy mirror trick...
set TEMP_EMPTY=%TEMP%\gradle-empty-%RANDOM%
mkdir "%TEMP_EMPTY%" >nul 2>&1
robocopy "%TEMP_EMPTY%" "%GRADLE_CACHE%" /MIR /R:0 /W:0 >nul 2>&1
rmdir "%TEMP_EMPTY%" >nul 2>&1
rmdir /s /q "%GRADLE_CACHE%" 2>nul
if not exist "%GRADLE_CACHE%" (
    echo SUCCESS: Directory deleted using robocopy method!
    goto :success
)
echo Method 3 failed.

echo.
echo ========================================
echo ERROR: Could not delete the directory
echo ========================================
echo.
echo The directory is still locked by another process.
echo.
echo Please try the following:
echo 1. Close your IDE completely (IntelliJ IDEA, Eclipse, VS Code)
echo 2. Open Task Manager (Ctrl+Shift+Esc)
echo 3. End all Java processes (java.exe, javaw.exe)
echo 4. Run this script again
echo.
echo Or manually delete this folder:
echo %GRADLE_CACHE%
echo.
pause
exit /b 1

:success
echo.
echo ========================================
echo SUCCESS: Gradle cache cleared!
echo ========================================
echo.
echo The problematic Gradle cache directory has been deleted.
echo The next time you run your Gradle build, it will automatically
echo re-download the Gradle distribution if needed.
echo.
echo You can now run your build commands normally.
echo.
pause
exit /b 0
