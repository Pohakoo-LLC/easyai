"use strict";

const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const { execFile, spawn } = require('node:child_process');
const fs = require('node:fs');
if (require('electron-squirrel-startup')) {
  app.quit();
}

let backendProcess;
let nextServerProcess;
const dir = __dirname;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(dir, 'preload.js'),
    },
    title: 'EasyAI App',
    darkTheme: true,
  });

  mainWindow.setMenu(null);
  mainWindow.loadURL('http://localhost:3000');

}

function startNextServer() {
  const nextServerPath = path.join(dir, 'frontend');
  console.log(`Attempting to start Next.js server from path: ${nextServerPath}`);
  nextServerProcess = spawn('npm', ['run', 'start:frontend'], { cwd: nextServerPath });
  nextServerProcess.on('error', (err) => {
    console.warn(`Error starting Next.js server: ${err.message}`);
  })
}

// Function to start the Python backend
function startBackend() {
  const backendPath = path.join(dir, 'backend/main.exe');
  backendProcess = execFile(backendPath, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting backend: ${error.message}`);
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`Backend stdout: ${stdout}`);
  });
}

app.on('ready', () => {
  startBackend();  // Start the Python backend
  startNextServer(); // Host the Next.js app
  createWindow();  // Create the Electron window
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();  // Ensure backend is terminated
  if (nextServerProcess) nextServerProcess.kill();  // Ensure Next.js server is terminated
  if (process.platform !== 'darwin') app.quit();
  app.exit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});