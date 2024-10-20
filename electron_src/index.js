"use strict";

const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { execFile, exec } = require('node:child_process');
if (require('electron-squirrel-startup')) {
  app.quit();
}

let backendProcess;
let nextServerProcess;
const dir = __dirname;
console.log('testt');

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

  // mainWindow.setMenu(null);
  mainWindow.loadURL('http://localhost:3000');
}

function startNextServer() {
  const nextServerPath = path.join(dir, 'frontend');
  const httpServerPath = path.join(dir, 'node_modules/.bin/http-server.cmd');
  nextServerProcess = exec(`${httpServerPath} --cors -p 3000 ${nextServerPath}`);
  // nextServerProcess.stdout.on('data', (data) => {
  //   console.log(`Next.js server stdout: ${data}`);
  // });
  nextServerProcess.on('error', (err) => {
    console.warn(`Error starting Next.js server: ${err.message}`);
  })
  nextServerProcess.on('exit', (code) => {
    console.log(`Next.js server exited with code ${code}`);
  });
}

// Function to start the Python backend
function startBackend() {
  console.log(`Attempting to start backend from path: ${dir}`);
  const backendPath = path.join(dir, 'backend/main.exe');
  backendProcess = execFile(backendPath);
}

app.on('ready', () => {
  startNextServer();  // Start the Next.js server
  startBackend();  // Start the Python backend
  createWindow();  // Create the Electron window
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();  // Ensure backend is terminated
  if (nextServerProcess) nextServerProcess.kill();  // Ensure Next.js server is terminated
  if (process.platform !== 'darwin') app.quit();
  app.exit();
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});