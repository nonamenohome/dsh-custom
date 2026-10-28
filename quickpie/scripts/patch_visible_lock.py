import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")

# 1) show.log 带版本与时间
s = s.replace("""      `${new Date().toISOString()} cursor=${pt.x},${pt.y}""",
"""      `v${app.getVersion()} ${new Date().toISOString()} cursor=${pt.x},${pt.y}""")

# 2) 拿不到单实例锁时给出可见提示，而不是静默退出
s = s.replace("""if (!gotLock) {
  app.quit();
} else {""",
"""if (!gotLock) {
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
} else {""")
p.write_text(s, encoding="utf-8")
print("ok")
