/*jshint esversion: 6 */

'use strict';

const {
  app,
  Menu,
  Tray,
  BrowserWindow,
  ipcMain
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
        mainWindow.show();
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

  appIcon.on('double-click', () => {
    mainWindow.show();
  })
}

ipcMain.on('message:unread', () => {
    mainWindow.setOverlayIcon(path.join(__dirname, 'favicon-notif.png'), 'پیام خوانده نشده')
    appIcon.setImage(path.join(__dirname, 'favicon-notif.png'))
})

ipcMain.on('message:read', () => {
  appIcon.setImage(path.join(__dirname, 'favicon.png'))
    mainWindow.setOverlayIcon(null,'')
})

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
