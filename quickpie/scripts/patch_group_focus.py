import pathlib
m = pathlib.Path("main.js")
s = m.read_text(encoding="utf-8")

old = """  if (item.type === 'group') {
    const target = String(item.target || '').trim();
    if (!target) throw new Error('这个分组没有设置默认目标（悬停可以选子项）');
    const err = await shell.openPath(target);
    if (err) throw new Error(err);
    return 'group->openPath';
  }"""

new = """  if (item.type === 'group') {
    const target = String(item.target || '').trim();
    if (!target) throw new Error('这个分组没有设置默认目标（悬停可以选子项）');
    // 目标是个正在运行的程序：唤醒已有窗口，别再启动一个
    if (target.toLowerCase().endsWith('.exe')) {
      const running = windowsForItem({ type: 'app', target, exe: item.exe || null });
      if (running.length) {
        focusWindowByPid(running[0].p);
        return 'group->focus-existing';
      }
    }
    const err = await shell.openPath(target);
    if (err) throw new Error(err);
    return 'group->openPath';
  }"""

assert old in s, "未找到分组分支原文"
s = s.replace(old, new, 1)

# 顺带：等窗口助手把缓存填好再判断（最多 1.5s）
s = s.replace("""      const running = windowsForItem({ type: 'app', target, exe: item.exe || null });
      if (running.length) {
        focusWindowByPid(running[0].p);
        return 'group->focus-existing';""",
"""      let running = windowsForItem({ type: 'app', target, exe: item.exe || null });
      for (let i = 0; i < 6 && !running.length; i += 1) {
        await new Promise((r) => setTimeout(r, 250));   // 等窗口助手第一轮数据
        running = windowsForItem({ type: 'app', target, exe: item.exe || null });
      }
      if (running.length) {
        focusWindowByPid(running[0].p);
        return 'group->focus-existing';""")
m.write_text(s, encoding="utf-8")
print("ok")
