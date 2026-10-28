import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""      { stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true });""",
"""      { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    console.log('[helper] spawned pid=' + helperProc.pid);""")
s = s.replace("""        winCache = map;""",
"""        winCache = map;
        console.log('[helper] windows=' + list.length + ' exes=' + map.size);""")
s = s.replace("""  helperProc.on('exit', () => {""",
"""  helperProc.stderr.setEncoding('utf8');
  helperProc.stderr.on('data', (d) => console.log('[helper:err] ' + String(d).slice(0, 300)));
  helperProc.on('exit', (code) => {
    console.log('[helper] exit code=' + code);""")
p.write_text(s, encoding="utf-8")
print("ok")
