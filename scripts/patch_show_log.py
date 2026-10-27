import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""  win.show();
  win.focus();
  ignoreBlurUntil = Date.now() + 500;""",
"""  win.show();
  win.focus();
  ignoreBlurUntil = Date.now() + 500;
  try {
    fs.appendFileSync(path.join(app.getPath('userData'), 'show.log'),
      `${new Date().toISOString()} cursor=${pt.x},${pt.y} bounds=${JSON.stringify(win.getBounds())} size=${size} displays=${JSON.stringify(screen.getAllDisplays().map((d) => d.workArea))}\\n`, 'utf8');
  } catch (_) { /* ignore */ }""")
p.write_text(s, encoding="utf-8")
print("ok")
