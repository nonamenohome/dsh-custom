import pathlib
m = pathlib.Path("main.js")
s = m.read_text(encoding="utf-8")

# 1) 通用唤醒函数
if "function summonExe" not in s:
    s = s.replace("""function defaultWeChatExe() {""",
"""/// 唤醒（或启动）一个 exe：走 app-summon.ps1，托盘隐藏的窗口也能拉出来
function summonExe(exePath) {
  const script = path.join(ROOT, 'app', 'app-summon.ps1');
  if (!fs.existsSync(script)) return false;
  const exeName = path.basename(exePath, path.extname(exePath));
  const child = spawn('powershell.exe',
    ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script,
     '-Exe', exePath, '-ProcName', exeName],
    { env: { ...process.env, TEMP: helperTmp(), TMP: helperTmp() }, windowsHide: true });
  child.unref();
  return true;
}

function defaultWeChatExe() {""")

# 2) 分组分支：.exe 走唤醒器
old_group = """    // 目标是个正在运行的程序：唤醒已有窗口，别再启动一个
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
    }"""
new_group = """    // 目标是个程序：走唤醒器（已运行则把窗口拉出来，未运行则启动）
    if (target.toLowerCase().endsWith('.exe') && summonExe(target)) {
      return 'group->summon';
    }"""
assert old_group in s
s = s.replace(old_group, new_group, 1)

# 3) 应用分支：同样走唤醒器
old_app = """  // 程序已经在跑：唤醒已有窗口，不再启动第二个实例
  const lowerTarget = target.toLowerCase();
  if (lowerTarget.endsWith('.exe') && (item.type === 'app' || item.type === 'group')) {
    const running = windowsForItem({ type: 'app', target, exe: item.exe || null });
    if (running.length) {
      focusWindowByPid(running[0].p);
      return 'focus-existing';
    }
  }
"""
new_app = """  // 程序：走唤醒器（已运行则唤出窗口，未运行则启动）
  const lowerTarget = target.toLowerCase();
  if (lowerTarget.endsWith('.exe') && (item.type === 'app' || item.type === 'group') && summonExe(target)) {
    return 'summon';
  }
"""
assert old_app in s
s = s.replace(old_app, new_app, 1)
m.write_text(s, encoding="utf-8")
print("ok")
