const { app, BrowserWindow, ipcMain, screen, desktopCapturer } = require('electron');
const fs = require('fs').promises;
const path = require('path');

let mainWindow;

function getMacroFilePath() {
  return path.join(app.getPath('userData'), 'macros.json');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 750,
    minWidth: 700,
    minHeight: 600,
    backgroundColor: '#0a0a0f',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'icon.png'),
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ─── IPC Handlers ──────────────────────────────────────────────────────────────

ipcMain.handle('mouse-move', async (_event, { x, y }) => {
  try {
    const { mouse, straightTo, Point } = require('@nut-tree-fork/nut-js');
    await mouse.move(straightTo(new Point(x, y)));
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('mouse-click', async (_event, { x, y, button }) => {
  try {
    const { mouse, straightTo, Point, Button } = require('@nut-tree-fork/nut-js');
    const btn = button === 'right' ? Button.RIGHT : button === 'middle' ? Button.MIDDLE : Button.LEFT;
    await mouse.move(straightTo(new Point(x, y)));
    await mouse.click(btn);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('mouse-double-click', async (_event, { x, y }) => {
  try {
    const { mouse, straightTo, Point, Button } = require('@nut-tree-fork/nut-js');
    await mouse.move(straightTo(new Point(x, y)));
    await mouse.doubleClick(Button.LEFT);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('mouse-scroll', async (_event, { x, y, direction, amount }) => {
  try {
    const { mouse, straightTo, Point, scrollDown, scrollUp } = require('@nut-tree-fork/nut-js');
    await mouse.move(straightTo(new Point(x, y)));
    if (direction === 'up') await mouse.scroll(scrollUp(amount));
    else await mouse.scroll(scrollDown(amount));
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('mouse-drag', async (_event, { fromX, fromY, toX, toY }) => {
  try {
    const { mouse, straightTo, Point, Button } = require('@nut-tree-fork/nut-js');
    await mouse.move(straightTo(new Point(fromX, fromY)));
    await mouse.pressButton(Button.LEFT);
    await mouse.move(straightTo(new Point(toX, toY)));
    await mouse.releaseButton(Button.LEFT);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('keyboard-type', async (_event, { text }) => {
  try {
    const { keyboard } = require('@nut-tree-fork/nut-js');
    await keyboard.type(text);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('keyboard-key', async (_event, { keys }) => {
  try {
    const { keyboard, Key } = require('@nut-tree-fork/nut-js');
    const resolvedKeys = keys.map(k => {
      const keyMap = {
        Enter: Key.Enter, Space: Key.Space, Tab: Key.Tab, Escape: Key.Escape,
        Backspace: Key.Backspace, Delete: Key.Delete,
        ArrowUp: Key.Up, ArrowDown: Key.Down, ArrowLeft: Key.Left, ArrowRight: Key.Right,
        Control: Key.LeftControl, Alt: Key.LeftAlt, Shift: Key.LeftShift,
        Meta: Key.LeftSuper, F1: Key.F1, F2: Key.F2, F3: Key.F3, F4: Key.F4,
        F5: Key.F5, F6: Key.F6, F7: Key.F7, F8: Key.F8, F9: Key.F9,
        F10: Key.F10, F11: Key.F11, F12: Key.F12,
        Home: Key.Home, End: Key.End, PageUp: Key.PageUp, PageDown: Key.PageDown,
        a: Key.A, b: Key.B, c: Key.C, d: Key.D, e: Key.E, f: Key.F, g: Key.G,
        h: Key.H, i: Key.I, j: Key.J, k: Key.K, l: Key.L, m: Key.M, n: Key.N,
        o: Key.O, p: Key.P, q: Key.Q, r: Key.R, s: Key.S, t: Key.T, u: Key.U,
        v: Key.V, w: Key.W, x: Key.X, y: Key.Y, z: Key.Z,
      };
      return keyMap[k] || Key.Space;
    });
    if (resolvedKeys.length === 1) await keyboard.pressKey(resolvedKeys[0]);
    else await keyboard.pressKey(...resolvedKeys);
    await keyboard.releaseKey(...resolvedKeys);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-mouse-position', async () => {
  try {
    const { mouse } = require('@nut-tree-fork/nut-js');
    const pos = await mouse.getPosition();
    return { success: true, x: pos.x, y: pos.y };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('set-mouse-speed', async (_event, { speed }) => {
  try {
    const { mouse } = require('@nut-tree-fork/nut-js');
    mouse.config.mouseSpeed = speed;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-screen-size', () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  return { width: primaryDisplay.size.width, height: primaryDisplay.size.height };
});

ipcMain.handle('load-macro-list', async () => {
  try {
    const filePath = getMacroFilePath();
    const contents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(contents);
    const list = Object.keys(data).sort();
    return { success: true, list };
  } catch (err) {
    if (err.code === 'ENOENT') return { success: true, list: [] };
    return { success: false, error: err.message };
  }
});

ipcMain.handle('save-macro-as', async (_event, { name, steps }) => {
  try {
    const filePath = getMacroFilePath();
    let data = {};
    try {
      const contents = await fs.readFile(filePath, 'utf8');
      data = JSON.parse(contents);
    } catch (e) {}
    data[name] = steps || [];
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('load-macro', async (_event, { name }) => {
  try {
    const filePath = getMacroFilePath();
    const contents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(contents);
    const steps = data[name] || [];
    return { success: true, steps: Array.isArray(steps) ? steps : [] };
  } catch (err) {
    if (err.code === 'ENOENT') return { success: true, steps: [] };
    return { success: false, error: err.message };
  }
});

ipcMain.handle('delete-macro', async (_event, { name }) => {
  try {
    const filePath = getMacroFilePath();
    const contents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(contents);
    delete data[name];
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-macros-json', async () => {
  try {
    const filePath = getMacroFilePath();
    const contents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(contents);
    return { success: true, json: JSON.stringify(data, null, 2), data };
  } catch (err) {
    if (err.code === 'ENOENT') return { success: true, json: '{}', data: {} };
    return { success: false, error: err.message };
  }
});

ipcMain.handle('load-macros-json', async (_event, { json }) => {
  try {
    const data = JSON.parse(json);
    const filePath = getMacroFilePath();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-desktop-sources', async (_event, opts) => {
  return await desktopCapturer.getSources(opts);
});

ipcMain.handle('run-macro', async (_event, { steps }) => {
  const results = [];
  for (const step of steps) {
    const delay = step.delay || 0;
    if (delay > 0) await new Promise(r => setTimeout(r, delay));

    try {
      const { mouse, keyboard, straightTo, Point, Button, Key } = require('@nut-tree-fork/nut-js');
      if (step.type === 'move') {
        await mouse.move(straightTo(new Point(step.x, step.y)));
        results.push({ step: step.type, success: true });
      } else if (step.type === 'click') {
        const btn = step.button === 'right' ? Button.RIGHT : step.button === 'double' ? Button.LEFT : Button.LEFT;
        await mouse.move(straightTo(new Point(step.x, step.y)));
        if (step.button === 'double') {
          await mouse.doubleClick(btn);
        } else {
          await mouse.click(btn);
        }
        results.push({ step: step.type, success: true });
      } else if (step.type === 'drag') {
        await mouse.move(straightTo(new Point(step.fromX, step.fromY)));
        await mouse.pressButton(Button.LEFT);
        await mouse.move(straightTo(new Point(step.toX, step.toY)));
        await mouse.releaseButton(Button.LEFT);
        results.push({ step: step.type, success: true });
      } else if (step.type === 'scroll') {
        await mouse.move(straightTo(new Point(step.x, step.y)));
        const scrollFunc = step.direction === 'up' ? require('@nut-tree-fork/nut-js').scrollUp : require('@nut-tree-fork/nut-js').scrollDown;
        await mouse.scroll(scrollFunc(step.amount));
        results.push({ step: step.type, success: true });
      } else if (step.type === 'type') {
        await keyboard.type(step.text);
        results.push({ step: step.type, success: true });
      } else if (step.type === 'wait') {
        await new Promise(r => setTimeout(r, step.ms || 500));
        results.push({ step: step.type, success: true });
      }
    } catch (err) {
      results.push({ step: step.type, success: false, error: err.message });
    }
  }
  return { success: true, results };
});
