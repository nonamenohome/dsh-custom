import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""/// 用 PowerShell 的 ExtractAssociatedIcon 兜底""",
"""function helperTmp() {
  const dir = path.join(app.getPath('userData'), 'tmp');
  try { fs.mkdirSync(dir, { recursive: true }); } catch (_) { /* ignore */ }
  return dir;
}

/// 用 PowerShell 的 ExtractAssociatedIcon 兜底""")
p.write_text(s, encoding="utf-8")
print("helperTmp ok")
