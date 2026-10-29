'use strict';

/**
 * QuickPie —— 轮盘式快捷启动器
 * 主进程：数据存储、窗口、全局热键、托盘、图标解析、系统打开动作
 */

const {
  app, BrowserWindow, Menu, Tray, dialog, globalShortcut, ipcMain,
  nativeImage, net, screen, shell, clipboard,
} = require('electron');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');

app.setName('QuickPie');
app.setAppUserModelId('com.local.quickpie');

/* 数据目录：默认 %APPDATA%\QuickPie；可用 QUICKPIE_HOME 覆盖；
   若默认位置写不进去，保存时会自动退到 exe 同级的 PortableData。 */
let dataDirOverride = process.env.QUICKPIE_HOME || null;

function dataDir() {
  return dataDirOverride || app.getPath('userData');
}

function portableFallbackDir() {
  return path.join(path.dirname(process.execPath), 'PortableData');
}

const SHOT = process.argv.includes('--shot');
const SELFTEST = process.argv.includes('--selftest');
const ROOT = __dirname;
const WHEEL_DESIGN = 760;
const WHEEL_MIN = 400;
const PAGE_SIZE = 12;

const DEFAULT_SETTINGS = {
  hotkey: 'Control+Shift+Space',
  theme: 'auto',
  autoLaunch: false,
};

let state = { version: 1, settings: { ...DEFAULT_SETTINGS }, items: [] };
let firstRun = false;

let wheelWin = null;
let managerWin = null;
let tray = null;
let isQuitting = false;
let hotkeyInfo = { accelerator: '', ok: false, error: null };

/* ------------------------------------------------------------------ */
/* 数据层                                                              */
/* ------------------------------------------------------------------ */

function dataFile() {
  return path.join(dataDir(), 'data.json');
}

function newId() {
  return crypto.randomBytes(6).toString('hex');
}

function inferType(target) {
  const t = String(target || '').trim();
  if (!t) return 'file';
  if (/^(https?|mailto|ftp):/i.test(t)) return 'url';
  if (/^[\w-]+(\.[\w-]+)+(\/|$)/i.test(t) && !fs.existsSync(t)) return 'url';
  try {
    const st = fs.statSync(t);
    if (st.isDirectory()) return 'folder';
  } catch (_) { /* 不存在，继续按扩展名判断 */ }
  if (/\.(exe|bat|cmd|lnk|msi|appref-ms|url)$/i.test(t)) return 'app';
  return 'file';
}

function normalizeUrl(target) {
  const t = String(target || '').trim();
  if (!t) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(t)) return t;
  return 'https://' + t;
}

function autoName(type, target) {
  const t = String(target || '').trim();
  if (!t) return '未命名';
  if (type === 'url') {
    try {
      const u = new URL(normalizeUrl(t));
      return u.hostname.replace(/^www\./, '') + (u.pathname !== '/' ? u.pathname : '');
    } catch (_) {
      return t.slice(0, 40);
    }
  }
  const base = path.basename(t.replace(/[\\/]+$/, ''));
  if (type === 'app') return base.replace(/\.(exe|lnk|bat|cmd|url|appref-ms)$/i, '');
  return base || t;
}

function toItem(raw) {
  const target = String(raw.target ?? '').trim();
  const type = raw.type || inferType(target);
  return {
    id: raw.id || newId(),
    type,
    name: String(raw.name || autoName(type, target)).slice(0, 60),
    target,
    args: String(raw.args || ''),
    exe: raw.exe || null,
    icon: raw.icon || null,
    query: String(raw.query || ''),
    children: Array.isArray(raw.children) ? raw.children.map((c) => toItem(c)) : [],
    createdAt: raw.createdAt || Date.now(),
  };
}

function seedItems() {
  const home = os.homedir();
  const winDir = process.env.WINDIR || 'C:\\Windows';
  const exists = (p) => { try { return fs.existsSync(p); } catch (_) { return false; } };
  const candidates = [
    { type: 'folder', name: '桌面', target: path.join(home, 'Desktop') },
    { type: 'folder', name: '下载', target: path.join(home, 'Downloads') },
    { type: 'folder', name: '工作区', target: 'D:\\QYD\\dsh-file' },
    { type: 'url', name: 'GitHub', target: 'https://github.com' },
    { type: 'url', name: '哔哩哔哩', target: 'https://www.bilibili.com' },
    { type: 'app', name: '计算器', target: path.join(winDir, 'System32', 'calc.exe') },
  ];
  return candidates
    .filter((c) => c.type === 'url' || exists(c.target))
    .map((c) => toItem(c));
}

function loadState() {
  const file = dataFile();
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    state = {
      version: 1,
      settings: { ...DEFAULT_SETTINGS, ...(raw.settings || {}) },
      items: Array.isArray(raw.items) ? raw.items.map(toItem) : [],
    };
    return;
  } catch (err) {
    if (fs.existsSync(file)) {
      try { fs.copyFileSync(file, `${file}.bak`); } catch (_) { /* ignore */ }
    }
    firstRun = true;
  }
  state = { version: 1, settings: { ...DEFAULT_SETTINGS }, items: seedItems() };
  saveState();
}

function writeStateTo(dir) {
  const file = path.join(dir, 'data.json');
  fs.mkdirSync(dir, { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

function saveState() {
  try {
    writeStateTo(dataDir());
  } catch (err) {
    // 默认目录不可写（受限环境 / 只读安装位置）→ 退到便携目录
    try {
      if (!dataDirOverride) {
        dataDirOverride = portableFallbackDir();
        writeStateTo(dataDirOverride);
        console.warn('[quickpie] 数据目录不可写，改用', dataDirOverride);
        return;
      }
    } catch (err2) {
      console.error('[quickpie] 保存配置失败:', err2.message);
      return;
    }
    console.error('[quickpie] 保存配置失败:', err.message);
  }
}

function broadcast() {
  for (const win of [wheelWin, managerWin]) {
    if (win && !win.isDestroyed()) win.webContents.send('store:changed');
  }
}

/* ------------------------------------------------------------------ */
/* 图标                                                                */
/* ------------------------------------------------------------------ */

const iconCache = new Map();

async function faviconFor(target) {
  if (iconCache.has(target)) return iconCache.get(target);
  let dataUrl = null;
  try {
    const host = new URL(normalizeUrl(target)).hostname;
    const res = await net.fetch(`https://${host}/favicon.ico`, {
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 0 && buf.length < 200 * 1024) {
        const mime = res.headers.get('content-type') || 'image/x-icon';
        dataUrl = `data:${mime};base64,${buf.toString('base64')}`;
      }
    }
  } catch (_) { /* 离线或站点无 favicon，用字母牌兜底 */ }
  iconCache.set(target, dataUrl);
  return dataUrl;
}

/// 微信 exe：target 无效时按常见安装位置找
function defaultWeChatExe() {
  const candidates = [
    'D:\\Weixin\\Weixin.exe',
    'C:\\Program Files\\Tencent\\Weixin\\Weixin.exe',
    'C:\\Program Files (x86)\\Tencent\\WeChat\\WeChat.exe',
    'C:\\Program Files\\Tencent\\WeChat\\WeChat.exe',
  ];
  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p; } catch (_) { /* ignore */ }
  }
  return candidates[0];
}

function helperTmp() {
  const dir = path.join(app.getPath('userData'), 'tmp');
  try { fs.mkdirSync(dir, { recursive: true }); } catch (_) { /* ignore */ }
  return dir;
}

/// 用 PowerShell 的 ExtractAssociatedIcon 兜底（有些 WindowsApps/UWP 的 exe
/// Electron 的 getFileIcon 拿不到，但 shell32 这条老路还能出图）
function iconViaPowerShell(target) {
  return new Promise((resolve) => {
    try {
      const tmp = helperTmp();
      const script = [
        'Add-Type -AssemblyName System.Drawing',
        '$p = ' + JSON.stringify(target),
        'try {',
        '  $i = [System.Drawing.Icon]::ExtractAssociatedIcon($p)',
        '  if ($i) {',
        '    $b = $i.ToBitmap()',
        '    $ms = New-Object System.IO.MemoryStream',
        '    $b.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)',
        '    [Convert]::ToBase64String($ms.ToArray())',
        '  }',
        '} catch { }',
      ].join('; ');
      const child = spawn('powershell.exe',
        ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script],
        { env: { ...process.env, TEMP: tmp, TMP: tmp }, windowsHide: true });
      let out = '';
      const timer = setTimeout(() => { try { child.kill(); } catch (_) { /* ignore */ } resolve(null); }, 2500);
      child.stdout.on('data', (d) => { out += d.toString('utf8'); });
      child.on('error', () => { clearTimeout(timer); resolve(null); });
      child.on('close', () => {
        clearTimeout(timer);
        const b64 = out.trim().split(/\r?\n/).pop();
        resolve(b64 && b64.length > 200 ? `data:image/png;base64,${b64}` : null);
      });
    } catch (_) {
      resolve(null);
    }
  });
}

/// 依次尝试一串候选路径，谁先出图用谁
async function resolveIcon(type, target, extra = []) {
  const t = String(target || '').trim();
  if (!t) return null;
  if (type === 'url') return faviconFor(t);

  const candidates = [];
  for (const p of [...extra, t]) {
    const v = String(p || '').trim();
    if (v && !candidates.includes(v)) candidates.push(v);
  }

  for (const p of candidates) {
    try {
      const img = await app.getFileIcon(p, { size: 'large' });
      if (img && !img.isEmpty()) return img.toDataURL();
    } catch (_) { /* 换下一个 */ }
  }

  for (const p of candidates) {
    const icon = await iconViaPowerShell(p);
    if (icon) return icon;
  }

  // 会话类条目兜底：用内置的微信图标，避免显示成字母牌
  if (type === 'chat' || type === 'wechat') {
    try {
      const bundled = path.join(ROOT, 'app', 'wechat-icon.png');
      if (fs.existsSync(bundled)) {
        return `data:image/png;base64,${fs.readFileSync(bundled).toString('base64')}`;
      }
    } catch (_) { /* ignore */ }
  }
  return null;
}

/** 启动时补齐系统图标：本地文件先补齐，网址图标后台慢慢取 */
async function hydrateIcons() {
  // 每补一个就落库：中途退出也不会白跑
  const pending = [];
  const walk = (list) => {
    for (const it of list) {
      if (!it.icon && it.type !== 'url') pending.push(it);
      if (it.children && it.children.length) walk(it.children);
    }
  };
  walk(state.items);

  for (const item of pending) {
    const isChat = item.type === 'chat' || item.type === 'wechat';
    const iconTarget = isChat
      ? (item.target && fs.existsSync(item.target) ? item.target : defaultWeChatExe())
      : (item.exe || item.target);
    const icon = await resolveIcon(item.type, iconTarget,
      item.shortcut ? [item.shortcut] : []);
    if (icon) {
      item.icon = icon;
      saveState();
      broadcast();
    }
  }

  (async () => {
    let later = false;
    for (const item of state.items.filter((it) => !it.icon && it.type === 'url')) {
      const icon = await resolveIcon(item.type, item.target);
      if (icon) { item.icon = icon; later = true; }
    }
    if (later) { saveState(); broadcast(); }
  })().catch(() => {});
}

/* ------------------------------------------------------------------ */
/* 窗口助手：外环「这个应用有哪些窗口」的数据源                          */
/* 用常驻 PowerShell + Add-Type（内存编译）枚举，不落地新 exe            */
/* ------------------------------------------------------------------ */

let helperProc = null;
let helperRestart = null;
let winCache = new Map(); // exeLower -> [{h,p,e,t}]

function startWindowHelper() {
  const script = path.join(ROOT, 'app', 'winlist.ps1');
  if (!fs.existsSync(script)) return;
  if (helperProc) return;
  // Add-Type 会往 TEMP 写编译临时文件；这台机器把 TEMP 拒了，指到可写目录
  let helperTmp = path.join(app.getPath('userData'), 'tmp');
  try {
    fs.mkdirSync(helperTmp, { recursive: true });
  } catch (_) {
    helperTmp = path.join(ROOT, '.tmp');
    try { fs.mkdirSync(helperTmp, { recursive: true }); } catch (_) { /* ignore */ }
  }
  try {
    helperProc = spawn('powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
        env: { ...process.env, TEMP: helperTmp, TMP: helperTmp },
      });
    console.log('[helper] spawned pid=' + helperProc.pid);
  } catch (err) {
    console.warn('[quickpie] 窗口助手启动失败:', err.message);
    helperProc = null;
    return;
  }

  let buf = '';
  helperProc.stdout.setEncoding('utf8');
  helperProc.stdout.on('data', (chunk) => {
    buf += chunk;
    let idx;
    while ((idx = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!line.startsWith('[')) continue;
      try {
        const list = JSON.parse(line);
        const map = new Map();
        for (const w of list) {
          const key = String(w.e || '').toLowerCase();
          if (!key) continue;
          if (!map.has(key)) map.set(key, []);
          map.get(key).push(w);
        }
        winCache = map;
        console.log('[helper] windows=' + list.length + ' exes=' + map.size);
        if (wheelWin && !wheelWin.isDestroyed() && wheelWin.isVisible()) {
          wheelWin.webContents.send('windows:changed');
        }
      } catch (_) { /* 忽略坏行 */ }
    }
  });
  helperProc.stderr.setEncoding('utf8');
  helperProc.stderr.on('data', (d) => console.log('[helper:err] ' + String(d).slice(0, 300)));
  helperProc.on('exit', (code) => {
    console.log('[helper] exit code=' + code);
    helperProc = null;
    clearTimeout(helperRestart);
    helperRestart = setTimeout(startWindowHelper, 4000);
  });
}

function windowsForItem(item) {
  if (!item || (item.type !== 'app' && item.type !== 'chat' && item.type !== 'wechat')) return [];
  const source = item.exe || item.target;
  const base = String(source || '').split(/[\\/]/).pop().toLowerCase();
  if (!base.endsWith('.exe')) return [];
  return winCache.get(base) || [];
}

function focusWindowByPid(pid) {
  const n = Number(pid);
  if (!Number.isFinite(n) || n <= 0) return;
  try {
    spawn('powershell.exe',
      ['-NoProfile', '-NonInteractive', '-Command',
        `(New-Object -ComObject WScript.Shell).AppActivate(${n}) | Out-Null`],
      { stdio: 'ignore', windowsHide: true, detached: true }).unref();
  } catch (_) { /* ignore */ }
}

/* ------------------------------------------------------------------ */
/* 打开条目                                                            */
/* ------------------------------------------------------------------ */

async function openItem(item) {
  if (!item) throw new Error('条目不存在');
  if (item.type === 'group') {
    const target = String(item.target || '').trim();
    if (!target) throw new Error('这个分组没有设置默认目标（悬停可以选子项）');
    // 目标是个正在运行的程序：唤醒已有窗口，别再启动一个
    if (target.toLowerCase().endsWith('.exe')) {
      let running = windowsForItem({ type: 'app', target, exe: item.exe || null });
      for (let i = 0; i < 6 && !running.length; i += 1) {
        await new Promise((r) => setTimeout(r, 250));   // 等窗口助手第一轮数据
        running = windowsForItem({ type: 'app', target, exe: item.exe || null });
      }
      if (running.length) {
        focusWindowByPid(running[0].p);
        return 'group->focus-existing';
      }
    }
    const err = await shell.openPath(target);
    if (err) throw new Error(err);
    return 'group->openPath';
  }
  const target = String(item.target || '').trim();
  const isChatItem = item.type === 'chat' || item.type === 'wechat';
  if (!target && !isChatItem) throw new Error('条目没有目标地址');

  if (item.type === 'url') {
    await shell.openExternal(normalizeUrl(target));
    return 'openExternal';
  }

  // 会话：优先切到同名的独立聊天窗口，否则唤醒主窗并在搜索框填好会话名
  if (item.type === 'chat' || item.type === 'wechat') {
    const query = String(item.query || item.name || '').trim();
    if (!query) throw new Error('这个会话条目没有填会话名');
    clipboard.writeText(query);
    const scriptPath = path.join(ROOT, 'app', 'wechat-chat.ps1');
    const exe = (target && fs.existsSync(target)) ? target : defaultWeChatExe();
    const child = spawn('powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', scriptPath,
       '-Query', query, '-Exe', exe],
      { env: { ...process.env, TEMP: helperTmp(), TMP: helperTmp() }, windowsHide: true });
    child.unref();
    return 'wechat-chat';
  }
  if (!fs.existsSync(target)) throw new Error(`路径不存在：${target}`);

  // 程序已经在跑：唤醒已有窗口，不再启动第二个实例
  const lowerTarget = target.toLowerCase();
  if (lowerTarget.endsWith('.exe') && (item.type === 'app' || item.type === 'group')) {
    const running = windowsForItem({ type: 'app', target, exe: item.exe || null });
    if (running.length) {
      focusWindowByPid(running[0].p);
      return 'focus-existing';
    }
  }

  // 文件夹 / 应用 / 文件：交给系统 shell。
  // 实测：spawn('explorer.exe') 在这里会以 code=1 退出、不开窗口；shell.openPath 正常。
  const err = await shell.openPath(target);
  if (err) throw new Error(err);
  return 'openPath';
}

function revealItem(item) {
  if (!item) return;
  const target = String(item.target || '').trim();
  if (item.type === 'url' || !fs.existsSync(target)) {
    shell.openExternal(normalizeUrl(target)).catch(() => {});
    return;
  }
  shell.showItemInFolder(target);
}

/* ------------------------------------------------------------------ */
/* 窗口                                                                */
/* ------------------------------------------------------------------ */

function loadRenderer(win, view) {
  win.loadFile(path.join(ROOT, 'app', 'index.html'), { query: { view, shot: SHOT ? '1' : '0' } });
}

function createWheelWindow() {
  if (wheelWin && !wheelWin.isDestroyed()) return wheelWin;
  wheelWin = new BrowserWindow({
    width: WHEEL_DESIGN,
    height: WHEEL_DESIGN,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    acceptFirstMouse: true,
    webPreferences: {
      preload: path.join(ROOT, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
    },
  });
  wheelWin.setAlwaysOnTop(true, 'screen-saver');
  wheelWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  wheelWin.setMenu(null);
  loadRenderer(wheelWin, 'wheel');

  wheelWin.on('blur', () => {
    if (SHOT || isQuitting) return;
    if (Date.now() < ignoreBlurUntil) return;   // 刚弹出的焦点抖动不算失焦
    hideWheel();
  });
  wheelWin.on('close', (e) => {
    if (isQuitting) return;
    e.preventDefault();
    hideWheel();
  });
  return wheelWin;
}

function wheelSizeFor(display) {
  const { width, height } = display.workAreaSize;
  const fit = Math.floor(Math.min(width, height) * 0.94);
  return Math.max(WHEEL_MIN, Math.min(WHEEL_DESIGN, fit));
}

let ignoreBlurUntil = 0;

function showWheel() {
  const win = createWheelWindow();
  const pt = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(pt);
  const { workArea } = display;
  const size = wheelSizeFor(display);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const x = clamp(Math.round(pt.x - size / 2), workArea.x, workArea.x + workArea.width - size);
  const y = clamp(Math.round(pt.y - size / 2), workArea.y, workArea.y + workArea.height - size);
  win.setBounds({ x, y, width: size, height: size });
  win.show();
  win.focus();
  ignoreBlurUntil = Date.now() + 500;
  try {
    fs.appendFileSync(path.join(app.getPath('userData'), 'show.log'),
      `v${app.getVersion()} ${new Date().toISOString()} cursor=${pt.x},${pt.y} bounds=${JSON.stringify(win.getBounds())} size=${size} displays=${JSON.stringify(screen.getAllDisplays().map((d) => d.workArea))}\n`, 'utf8');
  } catch (_) { /* ignore */ }
  win.webContents.send('wheel:opened', { size });
}

function hideWheel() {
  if (wheelWin && !wheelWin.isDestroyed() && wheelWin.isVisible()) wheelWin.hide();
}

function toggleWheel() {
  if (wheelWin && !wheelWin.isDestroyed() && wheelWin.isVisible()) hideWheel();
  else showWheel();
}

function createManagerWindow() {
  if (managerWin && !managerWin.isDestroyed()) {
    managerWin.show();
    managerWin.focus();
    return managerWin;
  }
  const wa = screen.getPrimaryDisplay().workAreaSize;
  const width = Math.min(1060, Math.max(780, wa.width - 60));
  const height = Math.min(720, Math.max(540, wa.height - 60));
  managerWin = new BrowserWindow({
    width,
    height,
    minWidth: Math.min(900, width),
    minHeight: Math.min(600, height),
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    title: 'QuickPie',
    icon: path.join(ROOT, 'build', 'icon.ico'),
    webPreferences: {
      preload: path.join(ROOT, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
    },
  });
  managerWin.setMenu(null);
  loadRenderer(managerWin, 'manager');
  managerWin.once('ready-to-show', () => managerWin.show());
  managerWin.on('closed', () => { managerWin = null; });
  return managerWin;
}

/* ------------------------------------------------------------------ */
/* 热键 / 托盘                                                         */
/* ------------------------------------------------------------------ */

function applyHotkey(accelerator) {
  globalShortcut.unregisterAll();
  hotkeyInfo = { accelerator, ok: false, error: null };
  if (!accelerator) {
    hotkeyInfo.error = '未设置快捷键';
    return hotkeyInfo;
  }
  try {
    const ok = globalShortcut.register(accelerator, toggleWheel);
    hotkeyInfo.ok = ok;
    if (!ok) hotkeyInfo.error = '该快捷键已被其他程序占用';
  } catch (err) {
    hotkeyInfo.error = err.message || '快捷键格式无效';
  }
  return hotkeyInfo;
}

let trayState = { created: false, error: null, iconSize: null };

function buildTray() {
  let image = nativeImage.createFromPath(path.join(ROOT, 'build', 'icon.ico'));
  trayState.iconSize = image.isEmpty() ? null : image.getSize();
  if (image.isEmpty()) {
    image = nativeImage.createEmpty();
  } else {
    image = image.resize({ width: 16, height: 16 });
  }
  try {
    tray = new Tray(image);
    tray.setToolTip('QuickPie 轮盘夹');
    trayState.created = true;
  } catch (err) {
    trayState.error = err.message;
    console.warn('[quickpie] 托盘创建失败:', err.message);
    return;
  }

  refreshTrayMenu();
  // ⚠️ 不能 tray.setContextMenu()：Windows 上设了上下文菜单后，左键会直接弹菜单，
  //    click 事件永远不触发（这就是"点托盘没反应"的原因）。
  //    改成右键手动 popUpContextMenu，左键留给"打开轮盘"。
  tray.on('click', () => showWheel());
  tray.on('right-click', () => { if (trayMenu) tray.popUpContextMenu(trayMenu); });
  tray.on('double-click', () => createManagerWindow());
}

let trayMenu = null;

function refreshTrayMenu() {
  if (!tray) return;
  const menu = Menu.buildFromTemplate([
    {
      label: `打开轮盘${state.settings.hotkey ? '   ' + prettyAccel(state.settings.hotkey) : ''}`,
      click: showWheel,
    },
    { label: '管理条目…', click: createManagerWindow },
    { type: 'separator' },
    {
      label: '开机自启',
      type: 'checkbox',
      checked: !!state.settings.autoLaunch,
      click: (mi) => updateSettings({ autoLaunch: mi.checked }),
    },
    { type: 'separator' },
    { label: '退出 QuickPie', click: () => { isQuitting = true; app.quit(); } },
  ]);
  trayMenu = menu;
}

function prettyAccel(accel) {
  return accel
    .replace(/CommandOrControl|Control/g, 'Ctrl')
    .replace(/\+/g, '+');
}

function applyAutoLaunch(enabled) {
  try {
    app.setLoginItemSettings({
      openAtLogin: !!enabled,
      path: process.execPath,
      args: app.isPackaged ? [] : [ROOT],
    });
  } catch (err) {
    console.warn('[quickpie] 设置开机自启失败:', err.message);
  }
}

function updateSettings(patch) {
  if (patch.hotkey !== undefined && patch.hotkey !== state.settings.hotkey) {
    state.settings = { ...state.settings, ...patch };
    const info = applyHotkey(state.settings.hotkey);
    if (!info.ok) {
      state.settings.hotkey = hotkeyInfo.accelerator || '';
    }
    saveState();
    refreshTrayMenu();
    broadcast();
    return { ok: info.ok, error: info.error, settings: state.settings };
  }
  state.settings = { ...state.settings, ...patch };
  if (patch.autoLaunch !== undefined) applyAutoLaunch(patch.autoLaunch);
  saveState();
  refreshTrayMenu();
  broadcast();
  return { ok: true, settings: state.settings };
}

/* ------------------------------------------------------------------ */
/* 条目操作（IPC 与自检共用）                                            */
/* ------------------------------------------------------------------ */


/// 解析 .lnk 的真实目标；.url 则读出里面的 URL
function expandShortcut(target) {
  const lower = String(target || '').toLowerCase();
  if (lower.endsWith('.lnk')) {
    try {
      const detail = shell.readShortcutLink(target);
      if (detail && detail.target) return { exe: detail.target, args: detail.args || '' };
    } catch (_) { /* 解析失败就按原样用 */ }
  }
  if (lower.endsWith('.url')) {
    try {
      const text = fs.readFileSync(target, 'utf8');
      const m = text.match(/^URL=(.+)$/im);
      if (m && m[1].trim()) return { url: m[1].trim() };
    } catch (_) { /* ignore */ }
  }
  return null;
}

async function opAddItems(payload) {
  const list = Array.isArray(payload) ? payload : [payload];
  const added = [];
  for (const raw of list) {
    const target = String(raw?.target ?? '').trim();
    const rawChat = raw && (raw.type === 'chat' || raw.type === 'wechat');
    if (!target && !rawChat) continue;
    let item = toItem({ ...raw, target });
    const expanded = expandShortcut(item.target);
    if (expanded && expanded.url) {
      item = toItem({ ...raw, target: expanded.url, type: 'url' });
    } else if (expanded && expanded.exe) {
      item.exe = expanded.exe;                       // 供外环按 exe 匹配
      item.shortcut = item.target;                   // 留一手：图标先从 .lnk 本体取
      if (expanded.args && !item.args) item.args = expanded.args;
      if (!String(raw.name || '').trim()) item.name = autoName('app', expanded.exe);
    }
    const iconTarget = (item.type === 'chat' || item.type === 'wechat')
      ? (item.target && fs.existsSync(item.target) ? item.target : defaultWeChatExe())
      : (item.exe || item.target);
    item.icon = raw.icon || (await resolveIcon(item.type, iconTarget,
      item.shortcut ? [item.shortcut] : []));
    state.items.push(item);
    added.push(item);
  }
  if (added.length) {
    saveState();
    broadcast();
    // 缺图标的立刻后台补，补到一张广播一张（轮盘实时刷，不用重启）
    if (added.some((it) => !it.icon)) hydrateIcons().catch(() => {});
  }
  return added;
}

async function opUpdateItem(id, patch = {}) {
  const item = state.items.find((it) => it.id === id);
  if (!item) return { ok: false, error: '条目不存在' };
  const targetChanged = patch.target !== undefined && patch.target !== item.target;
  Object.assign(item, patch);
  if (targetChanged) {
    item.type = patch.type || inferType(item.target);
    item.icon = await resolveIcon(item.type, item.target);
  }
  saveState();
  broadcast();
  return { ok: true, item };
}

function opRemoveItem(id) {
  const before = state.items.length;
  state.items = state.items.filter((it) => it.id !== id);
  if (state.items.length !== before) { saveState(); broadcast(); }
  return { ok: true, removed: before - state.items.length };
}

function opReorder(ids) {
  if (!Array.isArray(ids)) return { ok: false };
  const map = new Map(state.items.map((it) => [it.id, it]));
  const next = [];
  for (const id of ids) {
    const it = map.get(id);
    if (it) { next.push(it); map.delete(id); }
  }
  for (const it of map.values()) next.push(it);
  state.items = next;
  saveState();
  broadcast();
  return { ok: true };
}

function opProbeMissing() {
  const missing = [];
  for (const item of state.items) {
    // 网址与会话没有本地路径，不参与存在性检查
    if (item.type === 'url' || item.type === 'chat' || item.type === 'wechat') continue;
    if (!String(item.target || '').trim()) continue;
    let ok = false;
    try { ok = fs.existsSync(item.target); } catch (_) { ok = false; }
    if (!ok) missing.push(item.id);
  }
  return { missing };
}

/* ------------------------------------------------------------------ */
/* IPC                                                                 */
/* ------------------------------------------------------------------ */

function registerIpc() {
  ipcMain.handle('store:get', () => ({
    items: state.items,
    settings: state.settings,
    hotkey: hotkeyInfo,
    meta: {
      version: app.getVersion(),
      dataDir: dataDir(),
      firstRun,
      pageSize: PAGE_SIZE,
    },
  }));

  ipcMain.handle('items:add', (_e, payload) => opAddItems(payload));
  ipcMain.handle('items:update', (_e, { id, patch }) => opUpdateItem(id, patch));
  ipcMain.handle('items:remove', (_e, id) => opRemoveItem(id));
  ipcMain.handle('items:reorder', (_e, ids) => opReorder(ids));
  ipcMain.handle('items:probe', () => opProbeMissing());
  ipcMain.handle('child:open', async (_e, { groupId, childId }) => {
    const group = state.items.find((it) => it.id === groupId);
    const child = group && (group.children || []).find((c) => c.id === childId);
    if (!child) return { ok: false, error: '子项不存在' };
    try {
      const via = await openItem(child);
      fs.appendFileSync(path.join(app.getPath('userData'), 'open.log'),
        `${new Date().toISOString()} OK   child ${child.type} ${child.target} [${via}]\n`, 'utf8');
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  /// 把若干顶层条目移进分组
  ipcMain.handle('items:nest', (_e, { ids = [], groupId }) => {
    const group = state.items.find((it) => it.id === groupId);
    if (!group || group.type !== 'group') return { ok: false, error: '目标不是分组' };
    const moving = state.items.filter((it) => ids.includes(it.id) && it.id !== groupId);
    if (!moving.length) return { ok: false, error: '没有可移动的条目' };
    group.children = [...(group.children || []), ...moving];
    state.items = state.items.filter((it) => !moving.includes(it));
    saveState();
    broadcast();
    return { ok: true, moved: moving.length };
  });

  /// 把子项移回顶层
  ipcMain.handle('child:add', async (_e, { groupId, payload = {} }) => {
    const group = state.items.find((it) => it.id === groupId);
    if (!group || group.type !== 'group') return { ok: false, error: '分组不存在' };
    const target = String(payload.target || '').trim();
    if (!target) return { ok: false, error: '目标为空' };
    const child = toItem({ ...payload, target });
    if (!payload.icon) child.icon = await resolveIcon(child.type, child.exe || child.target).catch(() => null);
    group.children = [...(group.children || []), child];
    saveState();
    broadcast();
    if (!child.icon) hydrateIcons().catch(() => {});
    return { ok: true, child };
  });

  ipcMain.handle('child:update', (_e, { groupId, childId, patch = {} }) => {
    const group = state.items.find((it) => it.id === groupId);
    const child = group && (group.children || []).find((c) => c.id === childId);
    if (!child) return { ok: false, error: '子项不存在' };
    if (patch.name !== undefined) child.name = String(patch.name).slice(0, 60);
    if (patch.target !== undefined) child.target = String(patch.target).trim();
    if (patch.type !== undefined) child.type = patch.type;
    if (patch.args !== undefined) child.args = String(patch.args);
    if (patch.target !== undefined) {
      resolveIcon(child.type, child.target).then((icon) => {
        child.icon = icon;
        saveState();
        broadcast();
      }).catch(() => {});
    }
    saveState();
    broadcast();
    return { ok: true, child };
  });

  ipcMain.handle('items:unnest', (_e, { groupId, childId }) => {
    const group = state.items.find((it) => it.id === groupId);
    if (!group) return { ok: false, error: '分组不存在' };
    const child = (group.children || []).find((c) => c.id === childId);
    if (!child) return { ok: false, error: '子项不存在' };
    group.children = group.children.filter((c) => c.id !== childId);
    state.items.push(child);
    saveState();
    broadcast();
    return { ok: true };
  });

  ipcMain.handle('icon:resolve', async (_e, { type, target }) => resolveIcon(type, target));

  ipcMain.handle('settings:update', (_e, patch) => updateSettings(patch || {}));

  ipcMain.handle('app:open', async (_e, id) => {
    const item = state.items.find((it) => it.id === id);
    const logPath = path.join(app.getPath('userData'), 'open.log');
    try {
      const via = await openItem(item);
      fs.appendFileSync(logPath, `${new Date().toISOString()} OK   ${item?.type} ${item?.target} [${via}]\n`, 'utf8');
      hideWheel();
      return { ok: true };
    } catch (err) {
      fs.appendFileSync(logPath, `${new Date().toISOString()} FAIL ${item?.type} ${item?.target} :: ${err.message}\n`, 'utf8');
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('app:reveal', (_e, id) => {
    revealItem(state.items.find((it) => it.id === id));
    return { ok: true };
  });

  ipcMain.handle('dialog:pick', async (e, kind) => {
    const win = BrowserWindow.fromWebContents(e.sender) || managerWin || wheelWin;
    if (kind === 'url') return { canceled: true };
    const properties = kind === 'folder' ? ['openDirectory'] : ['openFile'];
    const filters = kind === 'app'
      ? [{ name: '程序', extensions: ['exe', 'lnk', 'bat', 'cmd'] }, { name: '全部文件', extensions: ['*'] }]
      : [{ name: '全部文件', extensions: ['*'] }];
    const result = await dialog.showOpenDialog(win, {
      title: kind === 'folder' ? '选择文件夹' : kind === 'app' ? '选择应用' : '选择文件',
      properties,
      filters: kind === 'folder' ? undefined : filters,
    });
    if (result.canceled || !result.filePaths.length) return { canceled: true };
    return { canceled: false, path: result.filePaths[0] };
  });

  ipcMain.handle('icon:pick', async () => {
    const picked = await dialog.showOpenDialog(managerWin || wheelWin, {
      title: '选择图标图片',
      properties: ['openFile'],
      filters: [
        { name: '图片 / 图标', extensions: ['png', 'ico', 'jpg', 'jpeg', 'webp', 'bmp'] },
      ],
    });
    if (picked.canceled || !picked.filePaths.length) return { ok: false };
    const file = picked.filePaths[0];
    try {
      const buf = fs.readFileSync(file);
      const ext = path.extname(file).toLowerCase().replace('.', '');
      const mime = ext === 'ico' ? 'image/x-icon' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
      return { ok: true, icon: `data:${mime};base64,${buf.toString('base64')}` };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('clipboard:read', () => clipboard.readText());
  ipcMain.handle('windows:for', (_e, id) => {
    const item = state.items.find((it) => it.id === id);
    return windowsForItem(item);
  });
  ipcMain.handle('window:focus', (_e, pid) => {
    focusWindowByPid(pid);
    hideWheel();
    return { ok: true };
  });

  ipcMain.handle('data:export', async () => {
    const win = managerWin || wheelWin;
    const res = await dialog.showSaveDialog(win, {
      title: '导出 QuickPie 配置',
      defaultPath: path.join(app.getPath('documents'), 'quickpie-items.json'),
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });
    if (res.canceled || !res.filePath) return { ok: false, canceled: true };
    fs.writeFileSync(res.filePath, JSON.stringify(state, null, 2), 'utf8');
    return { ok: true, path: res.filePath };
  });

  ipcMain.handle('data:import', async () => {
    const win = managerWin || wheelWin;
    const res = await dialog.showOpenDialog(win, {
      title: '导入 QuickPie 配置',
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });
    if (res.canceled || !res.filePaths.length) return { ok: false, canceled: true };
    try {
      const raw = JSON.parse(fs.readFileSync(res.filePaths[0], 'utf8'));
      const incoming = Array.isArray(raw) ? raw : (raw.items || []);
      let count = 0;
      for (const entry of incoming) {
        const item = toItem(entry);
        if (!item.target) continue;
        const dup = state.items.some((it) => it.target === item.target && it.type === item.type);
        if (dup) continue;
        item.icon = await resolveIcon(item.type, item.target);
        state.items.push(item);
        count += 1;
      }
      saveState();
      broadcast();
      return { ok: true, count };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('dialog:dataDir', () => {
    shell.openPath(app.getPath('userData'));
    return { ok: true };
  });

  ipcMain.handle('wheel:show', () => { showWheel(); return { ok: true }; });
  ipcMain.handle('wheel:hide', () => { hideWheel(); return { ok: true }; });
  ipcMain.handle('manager:open', () => { createManagerWindow(); return { ok: true }; });
  ipcMain.handle('win:min', (e) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    if (win) win.minimize();
    return { ok: true };
  });
  ipcMain.handle('win:close', (e) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    if (win) win.close();
    return { ok: true };
  });
}

/* ------------------------------------------------------------------ */
/* 自检（--selftest）                                                   */
/* ------------------------------------------------------------------ */

async function runSelfTest() {
  const results = [];
  const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail: String(detail) });

  // 自检产物放在当前 userData 下（打包后在 asar 外，可写）
  const outDir = process.env.QUICKPIE_SELFTEST_OUT || dataDir();
  fs.mkdirSync(outDir, { recursive: true });
  const profile = path.join(outDir, 'selftest-profile');
  fs.rmSync(profile, { recursive: true, force: true });
  app.setPath('userData', profile);

  loadState();
  check('首次启动写入示例条目', state.items.length >= 4, `${state.items.length} 项`);
  check('示例含存在的目录', state.items.some((i) => i.type === 'folder' && fs.existsSync(i.target)));

  const added = await opAddItems([
    { target: 'https://example.com' },
    { target: 'D:\\QYD\\dsh-file' },
    { target: 'D:\\no\\such\\path.exe' },
    { target: '   ' },
  ]);
  check('批量添加并跳过空目标', added.length === 3, `新增 ${added.length}`);
  check('裸域名推断为网址', added[0].type === 'url', added[0].type);
  check('目录推断', added[1].type === 'folder', added[1].type);
  check('exe 推断为应用', added[2].type === 'app', added[2].type);
  check('目录条目取到系统图标', !!added[1].icon);

  const { missing } = opProbeMissing();
  check('失效路径被标记', missing.includes(added[2].id) && !missing.includes(added[1].id), missing.length + ' 个失效');

  const upd = await opUpdateItem(added[1].id, { name: '工作区测试' });
  check('重命名', upd.ok && state.items.find((i) => i.id === added[1].id).name === '工作区测试');

  const reversed = state.items.map((i) => i.id).reverse();
  opReorder(reversed);
  check('重排顺序', state.items[0].id === reversed[0]);

  opRemoveItem(added[2].id);
  check('删除条目', !state.items.some((i) => i.id === added[2].id));

  const raw = JSON.parse(fs.readFileSync(dataFile(), 'utf8'));
  check('写入磁盘的 JSON 与内存一致', raw.items.length === state.items.length, `${raw.items.length}/${state.items.length}`);

  let openErr = '';
  try {
    await openItem({ type: 'folder', target: 'D:\\no\\such\\dir' });
  } catch (err) {
    openErr = err.message;
  }
  check('打开不存在的路径会报错', /不存在/.test(openErr), openErr);

  const failed = results.filter((r) => !r.ok);
  const report = path.join(outDir, 'selftest.json');
  fs.writeFileSync(report, JSON.stringify(results, null, 2), 'utf8');
  console.log(`[selftest] ${results.length - failed.length}/${results.length} passed -> ${report}`);
  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? '  (' + r.detail + ')' : ''}`);
  process.exitCode = failed.length ? 1 : 0;
  isQuitting = true;
  app.exit(failed.length ? 1 : 0);
}

/* ------------------------------------------------------------------ */
/* 截图自检（--shot）                                                   */
/* ------------------------------------------------------------------ */

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function runShot() {
  const outDir = process.env.QUICKPIE_SHOT_DIR || path.resolve(ROOT, '..', '..', '.cache', 'shots');
  fs.mkdirSync(outDir, { recursive: true });
  const dark = process.argv.includes('--dark');
  const suffix = dark ? '-dark' : '';
  if (dark) {
    state.settings = { ...state.settings, theme: 'dark' };
  }

  const wheel = createWheelWindow();
  showWheel();
  await wait(1200);

  // 截图时自动挑一个正在运行的应用做外环演示
  let demoIndex = -1;
  if (winCache.size) {
    const preferred = [...winCache.keys()].find((k) => k !== 'electron.exe' && k !== 'quickpie.exe') || [...winCache.keys()][0];
    const exeName = preferred;
    const list = winCache.get(exeName) || [];
    if (list.length) {
      state.items.push(toItem({
        type: 'app',
        name: exeName.replace(/\.exe$/i, ''),
        target: (list[0] && list[0].x) || exeName,
        icon: null,
      }));
      demoIndex = state.items.length - 1;
      broadcast();
      await wait(400);
      wheel.webContents.send('shot:hover', demoIndex);
      await wait(900);
    }
  }

  let img = await wheel.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, `wheel${suffix}.png`), img.toPNG());
  const wheelBounds = wheel.getBounds();

  const manager = createManagerWindow();
  await wait(1500);
  img = await manager.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, `manager${suffix}.png`), img.toPNG());

  const diag = {
    displays: screen.getAllDisplays().map((d) => ({
      bounds: d.bounds, workArea: d.workArea, scale: d.scaleFactor,
    })),
    wheelBounds,
    hotkey: hotkeyInfo,
    tray: trayState,
    items: state.items.length,
    winCache: winCache.size,
    demoIndex,
    settings: state.settings,
    dataFile: dataFile(),
  };
  fs.writeFileSync(path.join(outDir, 'diag.json'), JSON.stringify(diag, null, 2), 'utf8');
  console.log('[shot] saved to', outDir, JSON.stringify(diag));
  isQuitting = true;
  app.quit();
}

/* ------------------------------------------------------------------ */
/* 生命周期                                                            */
/* ------------------------------------------------------------------ */

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  // 静默退出会让用户以为"点了没反应"，明确提示一下
  const { dialog } = require('electron');
  app.whenReady().then(() => {
    dialog.showMessageBoxSync({
      type: 'warning',
      title: 'QuickPie 已在运行',
      message: '已经有一个 QuickPie 在后台运行。',
      detail: '如果是旧版本，请先在任务管理器里结束所有 QuickPie.exe，再从快捷方式重新启动。',
      buttons: ['好'],
    });
    app.quit();
  });
} else {
  app.on('second-instance', () => showWheel());

  app.whenReady().then(async () => {
    app.setAppUserModelId('com.local.quickpie');
    try {
      fs.writeFileSync(path.join(app.getPath('userData'), 'argv.json'),
        JSON.stringify({ argv: process.argv, packaged: app.isPackaged }, null, 2), 'utf8');
    } catch (_) { /* ignore */ }
    loadState();
    registerIpc();
    createWheelWindow();
    applyHotkey(state.settings.hotkey);
    buildTray();
    applyAutoLaunch(state.settings.autoLaunch);
    hydrateIcons().catch(() => {});
    if (!process.argv.includes('--open-test')) startWindowHelper();

    if (SELFTEST) {
      runSelfTest().catch((err) => {
        console.error('[selftest] 崩溃', err);
        app.exit(1);
      });
      return;
    }
    const envDump = process.argv.includes('--env-dump');
    if (envDump) {
      const pick = {};
      for (const k of ['SystemRoot', 'windir', 'TEMP', 'TMP', 'USERPROFILE', 'APPDATA', 'PATH', 'ComSpec', 'SystemDrive', 'NUMBER_OF_PROCESSORS', 'OS']) {
        pick[k] = (process.env[k] || '<缺失>').slice(0, 120);
      }
      fs.writeFileSync(path.join(app.getPath('userData'), 'env.json'),
        JSON.stringify({ keys: Object.keys(process.env).length, pick }, null, 2), 'utf8');
      isQuitting = true;
      app.exit(0);
      return;
    }

    if (process.argv.includes('--spawn-test')) {
      const logPath = path.join(app.getPath('userData'), 'spawn-test.log');
      const log = (m) => fs.appendFileSync(logPath, `${new Date().toISOString()} ${m}\n`, 'utf8');
      const targets = [
        ['notepad.exe', []],
        ['explorer.exe', ['C:\\Users\\quyuedi\\Desktop']],
        ['cmd.exe', ['/c', 'echo hi > %USERPROFILE%\\qp-spawn-test.txt']],
      ];
      for (const [cmd, args] of targets) {
        try {
          const child = spawn(cmd, args, { stdio: 'ignore' });
          child.on('exit', (code) => log(`${cmd} exited code=${code}`));
          child.on('error', (e) => log(`${cmd} spawn error=${e.message}`));
          log(`${cmd} spawned pid=${child.pid}`);
        } catch (e) {
          log(`${cmd} throw=${e.message}`);
        }
      }
      await new Promise((r) => setTimeout(r, 4000));
      isQuitting = true;
      app.exit(0);
      return;
    }

    const openItemArg = process.argv.find((a) => a.startsWith('--open-item='));
    if (openItemArg) {
      const idx = Number(openItemArg.split('=')[1]);
      const item = state.items[idx];
      const logPath = path.join(app.getPath('userData'), 'open.log');
      const line = (tag, extra) => fs.appendFileSync(logPath,
        `${new Date().toISOString()} ${tag} #${idx} ${item?.type} ${item?.target} ${extra}\n`, 'utf8');
      try {
        const via = await openItem(item);
        line('OK  ', `[${via}]`);
      } catch (err) {
        line('FAIL', `:: ${err.message}`);
      }
      // 留 6 秒给子进程真正把窗口画出来，再退出（否则 Electron 退出会带走子进程）
      await new Promise((r) => setTimeout(r, 6000));
      isQuitting = true;
      app.exit(0);
      return;
    }
    if (process.argv.includes('--open-test')) {
      const { shell } = require('electron');
      const out = [];
      for (const it of state.items) {
        if (it.type === 'url') { out.push({ name: it.name, target: it.target, skip: 'url' }); continue; }
        // eslint-disable-next-line no-await-in-loop
        const err = await shell.openPath(it.target);
        out.push({ name: it.name, target: it.target, err: err || null });
      }
      const logPath = process.env.QUICKPIE_OPENTEST_LOG
        || path.join(app.getPath('userData'), 'open-test.json');
      fs.writeFileSync(logPath, JSON.stringify(out, null, 2), 'utf8');
      console.log('[open-test]', logPath);
      isQuitting = true;
      app.quit();
      return;
    }
    if (SHOT) {
      runShot();
      return;
    }
    // 启动即弹一次轮盘：双击后立刻有反馈（数据已存在时不会再开管理器窗口）
    if (firstRun) {
      createManagerWindow();
    } else if (!SHOT) {
      // 必须等渲染器加载完再弹，否则弹的是个空透明窗口（看起来像没反应）
      const win = createWheelWindow();
      const show = () => setTimeout(() => { try { showWheel(); } catch (_) { /* ignore */ } }, 350);
      if (win.webContents.isLoading()) win.webContents.once('did-finish-load', show);
      else show();
    }
  });

  app.on('window-all-closed', () => { /* 托盘常驻 */ });
  app.on('before-quit', () => {
    isQuitting = true;
    globalShortcut.unregisterAll();
    if (helperProc) {
      try { helperProc.kill(); } catch (_) { /* ignore */ }
      helperProc = null;
    }
  });
  app.on('will-quit', () => globalShortcut.unregisterAll());
}
