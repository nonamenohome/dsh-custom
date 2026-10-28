import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""    const openItemArg = process.argv.find((a) => a.startsWith('--open-item='));""",
"""    const envDump = process.argv.includes('--env-dump');
    if (envDump) {
      const pick = {};
      for (const k of ['SystemRoot', 'windir', 'TEMP', 'TMP', 'USERPROFILE', 'APPDATA', 'PATH', 'ComSpec', 'SystemDrive', 'NUMBER_OF_PROCESSORS', 'OS']) {
        pick[k] = (process.env[k] || '<缺失>').slice(0, 120);
      }
      fs.writeFileSync(path.join(app.getPath('userData'), 'env.json'),
        JSON.stringify({ keys: Object.keys(process.env).length, pick }, null, 2), 'utf8');
      isQuitting = true;
      app.exit(0);
      return;
    }

    const openItemArg = process.argv.find((a) => a.startsWith('--open-item='));""")
p.write_text(s, encoding="utf-8")
print("ok")
