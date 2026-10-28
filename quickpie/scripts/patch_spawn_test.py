import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""    const openItemArg = process.argv.find((a) => a.startsWith('--open-item='));""",
"""    if (process.argv.includes('--spawn-test')) {
      const logPath = path.join(app.getPath('userData'), 'spawn-test.log');
      const log = (m) => fs.appendFileSync(logPath, `${new Date().toISOString()} ${m}\\n`, 'utf8');
      const targets = [
        ['notepad.exe', []],
        ['explorer.exe', ['C:\\\\Users\\\\quyuedi\\\\Desktop']],
        ['cmd.exe', ['/c', 'echo hi > %USERPROFILE%\\\\qp-spawn-test.txt']],
      ];
      for (const [cmd, args] of targets) {
        try {
          const child = spawn(cmd, args, { stdio: 'ignore' });
          child.on('exit', (code) => log(`${cmd} exited code=${code}`));
          child.on('error', (e) => log(`${cmd} spawn error=${e.message}`));
          log(`${cmd} spawned pid=${child.pid}`);
        } catch (e) {
          log(`${cmd} throw=${e.message}`);
        }
      }
      await new Promise((r) => setTimeout(r, 4000));
      isQuitting = true;
      app.exit(0);
      return;
    }

    const openItemArg = process.argv.find((a) => a.startsWith('--open-item='));""")
p.write_text(s, encoding="utf-8")
print("ok")
