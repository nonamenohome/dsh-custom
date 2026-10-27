import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")

# 1) 托盘：不再 setContextMenu（否则左键只会弹菜单，click 不触发）
s = s.replace("""  refreshTrayMenu();
  tray.on('click', showWheel);
  tray.on('double-click', createManagerWindow);""",
"""  refreshTrayMenu();
  // ⚠️ 不能 tray.setContextMenu()：Windows 上设了上下文菜单后，左键会直接弹菜单，
  //    click 事件永远不触发（这就是"点托盘没反应"的原因）。
  //    改成右键手动 popUpContextMenu，左键留给"打开轮盘"。
  tray.on('click', () => showWheel());
  tray.on('right-click', () => { if (trayMenu) tray.popUpContextMenu(trayMenu); });
  tray.on('double-click', () => createManagerWindow());""")

s = s.replace("""function refreshTrayMenu() {""",
"""let trayMenu = null;

function refreshTrayMenu() {""")
s = s.replace("""  tray.setContextMenu(menu);""",
"""  trayMenu = menu;""")

# 2) 弹出后短暂忽略 blur（避免焦点在任务栏与轮盘之间切换时被立刻收起）
s = s.replace("""function showWheel() {""",
"""let ignoreBlurUntil = 0;

function showWheel() {""")
s = s.replace("""  win.show();
  win.focus();
  win.webContents.send('wheel:opened', { size });""",
"""  win.show();
  win.focus();
  ignoreBlurUntil = Date.now() + 500;
  win.webContents.send('wheel:opened', { size });""")
s = s.replace("""  wheelWin.on('blur', () => {
    if (SHOT || isQuitting) return;
    hideWheel();
  });""",
"""  wheelWin.on('blur', () => {
    if (SHOT || isQuitting) return;
    if (Date.now() < ignoreBlurUntil) return;   // 刚弹出的焦点抖动不算失焦
    hideWheel();
  });""")
p.write_text(s, encoding="utf-8")
print("ok")
