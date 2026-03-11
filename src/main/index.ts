import { app, BrowserWindow, ipcMain } from 'electron';
import findOpenSocket from '../renderer/client/find-open-socket'
import { isOSX } from './helpers';
import { createMainWindow } from './main-window';
import { Cleanup } from './cleanup';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const BACKGROUND_WINDOW_WEBPACK_ENTRY: string;

const isDev = !app.isPackaged;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
try {
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
} catch (_) {
  // electron-squirrel-startup not available
}

let mainWindow: BrowserWindow;
let bgWindow: BrowserWindow;
let cleanup = new Cleanup();

ipcMain.on('app-name', (event) => {
  event.returnValue = app.getName();
});

ipcMain.on('user-data-path', (event) => {
  event.returnValue = app.getPath('userData');
});

ipcMain.on('is-dev', (event) => {
  event.returnValue = isDev;
})

function createBackgroundWindow(socketName: string) {
  const win = new BrowserWindow({
    title: 'background',
    x: 500,
    y: 300,
    width: 700,
    height: 500,
    show: isDev,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      contextIsolation: false
    }
  })

  isDev && win.webContents.openDevTools()
  win.webContents.on('did-finish-load', () => {
    isDev && console.log('background finished loading')
    win.webContents.send('set-socket', { name: socketName })
  })
  win.loadURL(BACKGROUND_WINDOW_WEBPACK_ENTRY)

  win.on('close', (event) => {
    event.preventDefault();
    if (!win.isDestroyed())
      win.hide();
  });

  return win;
}

async function start(bootBg: boolean) {
  const serverSocket = await findOpenSocket()

  isDev && console.log('server socket', serverSocket)
  if (bootBg) {
    bgWindow = createBackgroundWindow(serverSocket)
  }

  mainWindow = createMainWindow(MAIN_WINDOW_WEBPACK_ENTRY, serverSocket, app.quit.bind(this), cleanup, bgWindow)
  cleanup.setWindows(mainWindow, bgWindow);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => start(true));

function beforeQuit(e) {
  const doneCleaning = cleanup.handleEvent(e);
  if (!doneCleaning)
    return;

  if (isOSX()) {
    app.exit(0);
  }
}

app.on('before-quit', beforeQuit);

app.on('activate', (event, hasVisibleWindows) => {
  if (isOSX()) {
    if (!hasVisibleWindows) {
      mainWindow.show();
    } else {
      const windows = BrowserWindow.getAllWindows();
      const hasBackground = !!windows.find(win => win.title === 'background')
      if (windows.length === 1 && hasBackground) {
        start(false);
      }
    }
  }
});
