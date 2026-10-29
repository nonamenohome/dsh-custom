import pathlib
m = pathlib.Path("main.js")
s = m.read_text(encoding="utf-8")

old = """  // 文件夹 / 应用 / 文件：交给系统 shell。"""
new = """  // 程序已经在跑：唤醒已有窗口，不再启动第二个实例
  const lowerTarget = target.toLowerCase();
  if (lowerTarget.endsWith('.exe') && (item.type === 'app' || item.type === 'group')) {
    const running = windowsForItem({ type: 'app', target, exe: item.exe || null });
    if (running.length) {
      focusWindowByPid(running[0].p);
      return 'focus-existing';
    }
  }

  // 文件夹 / 应用 / 文件：交给系统 shell。"""

assert old in s, "未找到 openPath 前的位置"
s = s.replace(old, new, 1)
m.write_text(s, encoding="utf-8")
print("已加入『唤醒已有实例』逻辑")
