@echo off
echo Setting up environment (this script only needs to be run once).

:: Check if the command python -V returns an error
for /f "tokens=2 delims= " %%i in ('python -V 2^>^&1') do set "python_version=%%i"


if not defined python_version (
    echo Python is not installed.
    cmd /k
) else (
    echo Python is installed.
)

:: Check if Node.js is installed
for /f "tokens=2 delims= " %%i in ('node -v 2^>^&1') do set "node_version=%%i"

:: Check if Node.js (and NPM) is installed
if not defined node_version (
    echo Node.js is not installed.
    pause
) else (
    echo Node.js is installed.
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
