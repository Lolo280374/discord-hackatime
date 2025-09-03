@echo off
title Vencord Installer
color 0A

echo.
echo =============================================
echo         VENCORD AUTOMATIC INSTALLER
echo =============================================
echo.
echo This script will install Vencord on your system.
echo.

:: Check for administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: This script is not running with administrator privileges.
    echo Some operations may fail. Consider running as administrator.
    pause
)

:: Check for Git installation
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed or not in PATH.
    echo Please install Git from https://git-scm.com/downloads
    echo and run this script again.
    pause
    exit /b 1
)

:: Check for Node.js installation
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo and run this script again.
    pause
    exit /b 1
)

:: Navigate to Documents folder
echo Navigating to your Documents folder...
cd /d %USERPROFILE%\Documents
if %errorlevel% neq 0 (
    echo ERROR: Could not navigate to Documents folder.
    pause
    exit /b 1
)

:: Clone Vencord repository
echo.
echo Cloning Vencord repository...
if exist Vencord (
    echo Vencord directory already exists. Updating...
    cd Vencord
    git pull
) else (
    git clone https://github.com/Vendicated/Vencord
    cd Vencord
)

if %errorlevel% neq 0 (
    echo ERROR: Failed to clone or update Vencord repository.
    pause
    exit /b 1
)

:: Delete LICENSE and README.md files
echo.
echo Removing unnecessary files...
if exist LICENSE (
    del LICENSE
    echo Removed LICENSE file.
)
if exist README.md (
    del README.md
    echo Removed README.md file.
)

:: Check for pnpm and install if needed
where pnpm >nul 2>&1
if %errorlevel% neq 0 (
    echo pnpm not found. Installing...
    npm install -g pnpm
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install pnpm.
        pause
        exit /b 1
    )
    echo pnpm installed successfully!
) else (
    echo pnpm is already installed, continuing...
)

:: Install dependencies
echo.
echo Installing Vencord dependencies...
pnpm install --no-frozen-lockfile
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies.
    pause
    exit /b 1
)

:: Build Vencord
echo.
echo Building Vencord...
pnpm build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build Vencord.
    pause
    exit /b 1
)

:: Inject Vencord
echo.
echo Injecting Vencord into Discord...
echo NOTE: Discord will be closed if running!
echo Injection will begin in 5 seconds...
timeout /t 5 > nul

pnpm inject
if %errorlevel% neq 0 (
    echo ERROR: Injection failed.
    pause
    exit /b 1
)

:: Done
echo.
echo =============================================
echo     VENCORD INSTALLATION COMPLETE!
echo =============================================
echo.
echo Vencord has been successfully installed!
echo You can now start Discord and enable the Hackatime plugin in settings.
echo.
echo Instructions for Hackatime plugin:
echo 1. Open Discord
echo 2. Open Vencord Settings (gear icon in the bottom-left)
echo 3. Go to Plugins tab and enable "Hackatime"
echo 4. Configure your Hackatime API key from hackatime.hackclub.com/my/settings
echo.
pause