const { app, BrowserWindow } = require('electron');
const path = require('path');
const { execFile, spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let backendProcess;
let nextServerProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'electron/preload.js'),
    },
  });

  // In development, load Next.js from localhost
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');  // Next.js dev server URL
  } else {
    // In production, load from the local Next.js server
    mainWindow.loadURL('http://localhost:3000');  // URL where Next.js server is running
  }
}

// Function to start the Python backend
function startBackend() {
  // Detect if we are in development mode
  const isDev = !app.isPackaged;
  let backendPath;

  if (isDev) {
    backendPath = path.join(__dirname, '../backend/dist/main');  // Adjust this path for development
  } else {
    backendPath = path.join(process.resourcesPath, 'backend/dist/main');  // Adjust for production
  }

  console.log(`Attempting to start backend from path: ${backendPath}`);

  if (!fs.existsSync(backendPath)) {
    console.error(`Backend executable not found at path: ${backendPath}`);
    return;
  }

  backendProcess = execFile(backendPath, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting backend: ${error.message}`);
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`Backend stdout: ${stdout}`);
  });
}

// Function to start the Next.js production server in production mode
function startNextServer() {
  if (!app.isPackaged) return;  // Only start this in production

  const nextServerPath = path.join(process.resourcesPath, 'nextjs-server.js');  // Path to Next.js server script

  if (!fs.existsSync(nextServerPath)) {
    console.error(`Next.js server not found at path: ${nextServerPath}`);
    return;
  }

  nextServerProcess = spawn('node', [nextServerPath], { stdio: 'inherit' });

  nextServerProcess.on('error', (error) => {
    console.error(`Failed to start Next.js server: ${error.message}`);
  });

  nextServerProcess.on('close', (code) => {
    console.log(`Next.js server exited with code: ${code}`);
  });
}

app.on('ready', () => {
  const isDev = !app.isPackaged;

  if (isDev) {
    console.log('Starting in development mode...');
  } else {
    console.log('Starting in production mode...');
    startNextServer();  // Start the Next.js production server
  }

  startBackend();  // Start the Python backend
  createWindow();  // Create the Electron window
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();  // Ensure backend is terminated
  if (nextServerProcess) nextServerProcess.kill();  // Ensure Next.js server is terminated
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
