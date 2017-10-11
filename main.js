/*jshint esversion: 6 */

'use strict';

if (require('electron-squirrel-startup')) return;

const {
  app,
  Menu,
  Tray,
  BrowserWindow,
  ipcMain,
  autoUpdater
} = require('electron');
const path = require('path');

const appVersion = require('./package.json').version;
const os = require('os').platform();

autoUpdater.on('update-available', function () {
  ipcMain.send('update:started');
    });

autoUpdater.on('update-downloaded', function () {
  mainWindow = null;
  app.isQuiting = true;
      autoUpdater.quitAndInstall();
    });

let appIcon = null;
let mainWindow;

if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
}

var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
if (mainWindow) {
  if (!mainWindow.isFocused()) mainWindow.show();
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.focus();
}
});

if (shouldQuit) {
app.quit();
return;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1200,
    minWidth : 784,
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

  mainWindow.on('close', function (event) {
          if( !app.isQuiting){
              event.preventDefault();
              mainWindow.hide();
          }
          return false;
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
        mainWindow = null;
        app.isQuiting = true;
            app.quit();
      }
    }
  ]);
  appIcon.setToolTip('Tecom');
  appIcon.setContextMenu(contextMenu);

  appIcon.on('double-click', () => {
    mainWindow.show();
  });
}

ipcMain.on('start:update', () => {
  autoUpdater.setFeedURL('http://updates.tecomdev.ir/update/' + os + '/' + appVersion);
  autoUpdater.checkForUpdates();
});

ipcMain.on('message:unread', () => {
    mainWindow.setOverlayIcon(path.join(__dirname, 'favicon-notif.png'), 'پیام خوانده نشده');
    appIcon.setImage(path.join(__dirname, 'favicon-notif.png'));
});

ipcMain.on('message:read', () => {
  appIcon.setImage(path.join(__dirname, 'favicon.png'));
    mainWindow.setOverlayIcon(null,'');
});

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
