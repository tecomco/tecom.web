/*jshint esversion: 6 */

'use strict';

const {
  app,
  Menu,
  Tray,
  BrowserWindow
} = require('electron');
const path = require('path');
let appIcon = null;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1200,
    icon: path.join(__dirname, 'favicon.png')
  });

  mainWindow.loadURL(
    `file://${__dirname}/app/components/login/login.electron.html`);

  mainWindow.webContents.openDevTools();
  mainWindow.webContents.on('crashed', function () {});
  mainWindow.on('unresponsive', function () {});
  process.on('uncaughtException', function () {});
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  appIcon = new Tray(path.join(__dirname, 'favicon.png'));
  const contextMenu = Menu.buildFromTemplate([{
      label: 'Show',
      click: function () {
        app.focus();
      }
    },
    {
      label: 'Close',
      click: function () {
        app.quit();
      }
    }
  ]);
  appIcon.setToolTip('Tecom');
  appIcon.setContextMenu(contextMenu);

}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  if (appIcon)
    appIcon.destroy();
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
