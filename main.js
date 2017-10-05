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

// var electronInstaller = require('electron-winstaller');
//
// var resultPromise = electronInstaller.createWindowsInstaller({
//     appDirectory: "C:/Users/AmirHossein Ameli/Desktop/dev/dev/tecom.web/Tecom-win32-x64",
//     outputDirectory: 'C:/Users/AmirHossein Ameli/Desktop/dev/dev/tecom.web/Tecom-win32-x64/release',
//     exe: 'Tecom.exe'
//   });
//   resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));

let appIcon = null;
let mainWindow;

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
              event.preventDefault()
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
