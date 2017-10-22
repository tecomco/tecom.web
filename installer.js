/*jshint esversion: 6 */

'use strict';
const electronInstaller = require('electron-winstaller');
const path = require('path');

const resultPromise = electronInstaller.createWindowsInstaller({
  appDirectory: path.join(__dirname, 'Tecom-win32-x64'),
  outputDirectory: path.join(__dirname, 'Tecom-win32-x64/release'),
  exe: 'Tecom.exe',
  authors: 'Tecom Co',
  description: 'Tecom.me',
  version: '0.0.1',
  title: 'Tecom',
  loadingGif: path.join(__dirname, 'static/img/loading.gif'),
  iconUrl: path.join(__dirname, 'favicon.ico'),
  setupIcon: path.join(__dirname, 'favicon.ico'),
  setupExe: 'Tecom.exe',
  noMsi: 'No'
});
resultPromise.then(() => console.log("It worked!"),
  (e) => console.log(`No dice: ${e.message}`));
