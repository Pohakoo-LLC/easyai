@echo off
setlocal

:: Prompt user for a custom Python path, or use the detected one
set "CUSTOM_PYTHON="
set /p CUSTOM_PYTHON="Enter the full path to the Python executable (leave blank to auto-detect): "

if not "%CUSTOM_PYTHON%"=="" (
    :: Check if the provided path is valid and retrieve the version
    for /f "tokens=2 delims= " %%i in ('"%CUSTOM_PYTHON%" -V 2^>nul') do set PYTHON_VERSION=%%i

    if not defined PYTHON_VERSION (
        echo Invalid Python path or Python is not installed.
        exit /b 1
    )
) else (
    :: Check if Python is installed and retrieve the version
    for /f "tokens=2 delims= " %%i in ('python -V 2^>nul') do set PYTHON_VERSION=%%i

    if not defined PYTHON_VERSION (
        echo Python is not installed.
        exit /b 1
    )

    :: Use default Python executable
    set "CUSTOM_PYTHON=python"
)

:: Display the detected Python version
echo Detected Python version: %PYTHON_VERSION%

:: Check if the version is 3.10.11
if "%PYTHON_VERSION%"=="3.10.11" (
    echo Python 3.10.11 is installed.
) else (
    echo Python 3.10.11 is not installed.
    echo Virtual environment will only be created with Python 3.10.11.
    exit /b 1
)

:: Check if npm is installed and retrieve the version
for /f "tokens=*" %%i in ('npm -v 2^>nul') do set NPM_VERSION=%%i

if not defined NPM_VERSION (
    echo npm is not installed.
    exit /b 1
)

:: Display the detected npm version
echo Detected npm version: %NPM_VERSION%

:: Create a virtual environment using Python 3.10.11
echo Creating virtual environment in folder "venv"...
%CUSTOM_PYTHON% -m venv venv

if not exist "venv" (
    echo Failed to create the virtual environment.
    exit /b 1
)

:: Check if requirements.txt exists and install requirements
if exist "requirements.txt" (
    echo Installing packages from requirements.txt...
    venv\Scripts\python -m pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo Failed to install the required packages.
        exit /b 1
    )
) else (
    echo requirements.txt not found. Skipping package installation.
)

:: Move to the backend directory and package the Python application
cd backend
echo Running PyInstaller to package main.py...
..\venv\Scripts\pyinstaller --onefile main.py

if %errorlevel% neq 0 (
    echo PyInstaller failed.
    exit /b 1
)

:: Move back to the project root directory
cd ..

:: Install Node.js dependencies
echo Installing npm dependencies...
call npm install --suppress-warnings

if %errorlevel% neq 0 (
    echo npm install failed.
    exit /b 1
)

:: Build the frontend
echo Building frontend...
call npm run build:frontend

if %errorlevel% neq 0 (
    echo Frontend build failed.
    exit /b 1
)

:: Ensure the destination directory exists
if not exist "electron_src\backend" (
    mkdir "electron_src\backend"
)

:: Copy the main.exe to the electron_src/backend directory
echo Copying main.exe to electron_src/backend/...
xcopy "backend\dist\main.exe" "electron_src\backend\main.exe*" /Y /F

if %errorlevel% neq 0 (
    echo Failed to copy main.exe.
    exit /b 1
)

:: Copy frontend build to electron_src/frontend directory
echo Copying frontend files to electron_src/frontend/...
xcopy frontend_dist\* electron_src\frontend\ /E /H /Y

if %errorlevel% neq 0 (
    echo Failed to copy frontend files.
    exit /b 1
)

:: Initialize a new npm project in the electron_src directory and install http-server
echo Initializing npm project in electron_src...
cd electron_src
call npm init -y
call npm install http-server
cd ..

:: Build the Electron app
echo Building the Electron application...
call npm run build:electron

if %errorlevel% neq 0 (
    echo Electron build failed.
    exit /b 1
)

echo Build completed successfully.