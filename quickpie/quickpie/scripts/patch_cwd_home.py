import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""    const child = spawn('explorer.exe', [target], { detached: true, stdio: 'ignore' });""",
"""    // cwd 交给用户目录：程序目录在受限工作区下，别让子进程继承它
    const home = process.env.USERPROFILE || process.env.HOMEDRIVE + process.env.HOMEPATH || 'C:\\\\';
    const child = spawn('explorer.exe', [target], { cwd: home, detached: true, stdio: 'ignore' });""")
p.write_text(s, encoding="utf-8")
print("ok")
