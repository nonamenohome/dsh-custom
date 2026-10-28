import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""    app.setAppUserModelId('com.local.quickpie');
    loadState();""",
"""    app.setAppUserModelId('com.local.quickpie');
    try {
      fs.writeFileSync(path.join(app.getPath('userData'), 'argv.json'),
        JSON.stringify({ argv: process.argv, packaged: app.isPackaged }, null, 2), 'utf8');
    } catch (_) { /* ignore */ }
    loadState();""")
p.write_text(s, encoding="utf-8")
print("ok")
