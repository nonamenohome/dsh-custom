import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
s = s.replace('''  const helperTmp = path.join(ROOT, '.tmp');
  try { fs.mkdirSync(helperTmp, { recursive: true }); } catch (_) { /* ignore */ }''',
'''  let helperTmp = path.join(app.getPath('userData'), 'tmp');
  try {
    fs.mkdirSync(helperTmp, { recursive: true });
  } catch (_) {
    helperTmp = path.join(ROOT, '.tmp');
    try { fs.mkdirSync(helperTmp, { recursive: true }); } catch (_) { /* ignore */ }
  }''')
p.write_text(s, encoding="utf-8")
print("ok")
