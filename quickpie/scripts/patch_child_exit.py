import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""  if (item.type === 'folder') {
    const child = spawn('explorer.exe', [target], { detached: true, stdio: 'ignore' });
    child.unref();
    return 'explorer.exe';
  }""",
"""  if (item.type === 'folder') {
    const child = spawn('explorer.exe', [target], { detached: true, stdio: 'ignore' });
    const logPath = path.join(app.getPath('userData'), 'open.log');
    child.on('error', (e) => fs.appendFileSync(logPath, `    spawn error: ${e.message}\\n`, 'utf8'));
    child.on('exit', (code, sig) => fs.appendFileSync(logPath, `    explorer exited code=${code} sig=${sig}\\n`, 'utf8'));
    child.unref();
    return 'explorer.exe';
  }""")
p.write_text(s, encoding="utf-8")
print("ok")
