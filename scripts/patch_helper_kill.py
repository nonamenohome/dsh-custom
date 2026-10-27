import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
# quit 时杀掉 helper，避免残留进程
s = s.replace("""  app.on('before-quit', () => { isQuitting = true; globalShortcut.unregisterAll(); });""",
"""  app.on('before-quit', () => {
    isQuitting = true;
    globalShortcut.unregisterAll();
    if (helperProc) {
      try { helperProc.kill(); } catch (_) { /* ignore */ }
      helperProc = null;
    }
  });""")
# open-test / shot 模式不需要窗口助手
s = s.replace("""    hydrateIcons().catch(() => {});
    startWindowHelper();""",
"""    hydrateIcons().catch(() => {});
    if (!process.argv.includes('--open-test')) startWindowHelper();""")
p.write_text(s, encoding="utf-8")
print("ok")
