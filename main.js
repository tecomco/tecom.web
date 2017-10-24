/*jshint esversion: 6 */

'use strict';

if (require('electron-squirrel-startup'))
  return;
if (handleSquirrelEvent())
  return;

const {
  app,
  Menu,
  Tray,
  BrowserWindow,
  ipcMain,
  autoUpdater,
  shell
} = require('electron');
const path = require('path');
const appVersion = require('./package.json').version;
const os = require('os').platform();
let trayIcon = null;
let tecomWindow;
var didAppRunBefore = app.makeSingleInstance(function () {
  if (tecomWindow) {
    if (!tecomWindow.isFocused()) tecomWindow.show();
    if (tecomWindow.isMinimized()) tecomWindow.restore();
    tecomWindow.focus();
  }
});
if (didAppRunBefore) {
  app.quit();
  return;
}

autoUpdater.on('update-available', function () {
  tecomWindow.webContents.send('update:started');
});

autoUpdater.on('update-downloaded', function () {
  tecomWindow = null;
  app.shouldQuit = true;
  autoUpdater.quitAndInstall();
});

ipcMain.on('start:update', () => {
  autoUpdater.setFeedURL('http://updates.tecomdev.ir/update/' + os + '/' +
    appVersion);
  autoUpdater.checkForUpdates();
});

ipcMain.on('message:unread', () => {
  tecomWindow.setOverlayIcon(path.join(__dirname, 'favicon-notif.png'),
    'پیام خوانده نشده');
  trayIcon.setImage(path.join(__dirname, 'favicon-notif.png'));
});

ipcMain.on('message:read', () => {
  trayIcon.setImage(path.join(__dirname, 'favicon.png'));
  tecomWindow.setOverlayIcon(null, '');
});

app.on('ready', createTecomWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  if (trayIcon)
    trayIcon.destroy();
});

app.on('activate', function () {
  if (tecomWindow === null) {
    createTecomWindow();
  }
});

function handleSquirrelEvent() {
  if (process.argv.length === 1)
    return false;

  const ChildProcess = require('child_process');
  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);
  const spawn = function (command, args) {
    let spawnedProcess, error;
    try {
      spawnedProcess = ChildProcess.spawn(command, args, {
        detached: true
      });
    } catch (error) {}
    return spawnedProcess;
  };

  const spawnUpdate = function (args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      spawnUpdate(['--createShortcut', exeName]);
      setTimeout(app.quit, 1000);
      return true;
    case '--squirrel-uninstall':
      spawnUpdate(['--removeShortcut', exeName]);
      setTimeout(app.quit, 1000);
      return true;
    case '--squirrel-obsolete':
      app.quit();
      return true;
  }
}

function createTecomWindow() {
  tecomWindow = new BrowserWindow({
    width: 1400,
    height: 1200,
    minWidth: 784,
    icon: path.join(__dirname, 'favicon.png')
  });

  tecomWindow.loadURL(
    `file://${__dirname}/app/components/login/login.electron.html`);
  tecomWindow.webContents.openDevTools();
  tecomWindow.webContents.on('crashed', function () {});
  tecomWindow.on('unresponsive', function () {});
  process.on('uncaughtException', function () {});
  tecomWindow.on('closed', function () {
    tecomWindow = null;
  });
  tecomWindow.webContents.on('new-window', function (event, url) {
    event.preventDefault();
    shell.openExternal(url);
  });
  tecomWindow.on('close', function (event) {
    if (!app.shouldQuit) {
      event.preventDefault();
      tecomWindow.hide();
    }
    return false;
  });

  trayIcon = new Tray(path.join(__dirname, 'favicon.png'));
  const contextMenu = Menu.buildFromTemplate([{
      label: 'Show',
      click: function () {
        tecomWindow.show();
      }
    },
    {
      label: 'Close',
      click: function () {
        tecomWindow = null;
        app.shouldQuit = true;
        app.quit();
    }
  }]);
  trayIcon.setToolTip('Tecom');
  trayIcon.setContextMenu(contextMenu);

  trayIcon.on('double-click', () => {
    tecomWindow.show();
  });
  trayIcon.on('click', function() {
   trayIcon.popUpContextMenu();
});
}
