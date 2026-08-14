import {
  app,
  BrowserWindow,
  ipcMain,
  screen,
} from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  const primaryDisplay =
    screen.getPrimaryDisplay();

  const { width, height } =
    primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,

    transparent: true,
    frame: false,
    resizable: false,
    movable: false,

    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,

    backgroundColor: '#00000000',

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
    },
  });

  /*
   * Keep Neko above normal windows.
   */
  mainWindow.setAlwaysOnTop(
    true,
    'floating'
  );

  /*
   * IMPORTANT:
   *
   * Start interactive so Pixi can receive
   * mouse events and dragging can work.
   *
   * We will make the overlay properly
   * click-through later.
   */
  mainWindow.setIgnoreMouseEvents(true, {
  forward: true,
});

  /*
   * Load renderer.
   */
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(
      process.env.VITE_DEV_SERVER_URL
    );

    mainWindow.webContents.openDevTools({
      mode: 'detach',
    });
  } else {
    mainWindow.loadFile(
      path.join(
        __dirname,
        '../dist/index.html'
      )
    );
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

/*
 * Renderer can control whether the
 * Electron window receives mouse events.
 *
 * ignore = true:
 *   Mouse passes through the overlay.
 *
 * ignore = false:
 *   Overlay receives mouse events.
 */
ipcMain.on(
  'set-ignore-mouse-events',
  (
    _event,
    ignore: boolean,
    options?: {
      forward?: boolean;
    }
  ) => {
    if (!mainWindow) return;

    mainWindow.setIgnoreMouseEvents(
      ignore,
      options
    );
  }
);

/*
 * App lifecycle.
 */
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (
      BrowserWindow.getAllWindows()
        .length === 0
    ) {
      createWindow();
    }
  });
});

app.on(
  'window-all-closed',
  () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }
);