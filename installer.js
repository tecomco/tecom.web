/*jshint esversion: 6 */

'use strict';

const electronInstaller = require('electron-winstaller');

const resultPromise = electronInstaller.createWindowsInstaller({
  appDirectory: "C:/Users/AmirHossein Ameli/Desktop/Tecom-clone/tecom.web/Tecom-win32-x64",
  outputDirectory: 'C:/Users/AmirHossein Ameli/Desktop/Tecom-clone/tecom.web/Tecom-win32-x64/release',
  exe: 'Tecom.exe',
  loadingGif: 'C:/Users/AmirHossein Ameli/Desktop/Tecom-clone/tecom.web/static/img/loading.gif',
  iconUrl: 'C:/Users/AmirHossein Ameli/Desktop/Tecom-clone/tecom.web/favicon.ico',
  setupIcon: 'C:/Users/AmirHossein Ameli/Desktop/Tecom-clone/tecom.web/favicon.ico',
  setupExe: 'Tecom.exe',
  noMsi: 'No'
});
resultPromise.then(() => console.log("It worked!"),
  (e) => console.log(`No dice: ${e.message}`));
