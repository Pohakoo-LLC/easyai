@echo off
echo Setting up environment (this script only needs to be run once).

:: Check if the command python -V returns an error
for /f "tokens=2 delims= " %%i in ('python -V 2^>^&1') do set "python_version=%%i"


if not defined python_version (
    echo Python is not installed.
    cmd /k
) else (
    echo Python 3.12.4 is installed.
)

:: Check if Node.js is installed and get the version
for /f "tokens=3" %%i in ('node --version 2^>nul') do set "node_version=%%i"

:: Check if Node.js (and NPM) is installed
if not defined node_version (
    echo Node.js is not installed. Downloading and installing Node.js...
    :: Set the download URL for Node.js installer
    set "node_installer=https://nodejs.org/dist/v18.17.1/node-v18.17.1-x64.msi"

    :: Download Node.js installer using PowerShell
    powershell -Command "Invoke-WebRequest -Uri '%node_installer%' -OutFile node_installer.msi"

    :: Install Node.js silently
    msiexec /i node_installer.msi /quiet /norestart

    :: Clean up installer file
    del node_installer.msi

    echo Node.js and NPM installation completed.
) else (
    echo Node.js version %node_version% is already installed.
)

:: Create a virtual environment
echo Creating a Python virtual environment...
python -m venv .venv
call .venv\Scripts\activate
pip install -r requirements.txt
deactivate
echo Virtual environment created successfully.

:: Install npm packages
echo Installing and building frontend packages...
npm install
npm run build
echo Successfully built.

echo Setup successful. You can now close this window.
pause
