import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""  try {
    helperProc = spawn('powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script],
      { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });""",
"""  // Add-Type 会往 TEMP 写编译临时文件；这台机器把 TEMP 拒了，指到可写目录
  const helperTmp = path.join(ROOT, '.tmp');
  try { fs.mkdirSync(helperTmp, { recursive: true }); } catch (_) { /* ignore */ }
  try {
    helperProc = spawn('powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
        env: { ...process.env, TEMP: helperTmp, TMP: helperTmp },
      });""")
p.write_text(s, encoding="utf-8")
print("ok")
