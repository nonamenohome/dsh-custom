import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""    if (process.argv.includes('--open-test')) {""",
"""    const openItemArg = process.argv.find((a) => a.startsWith('--open-item='));
    if (openItemArg) {
      const idx = Number(openItemArg.split('=')[1]);
      const item = state.items[idx];
      const logPath = path.join(app.getPath('userData'), 'open.log');
      const line = (tag, extra) => fs.appendFileSync(logPath,
        `${new Date().toISOString()} ${tag} #${idx} ${item?.type} ${item?.target} ${extra}\\n`, 'utf8');
      try {
        const via = await openItem(item);
        line('OK  ', `[${via}]`);
      } catch (err) {
        line('FAIL', `:: ${err.message}`);
      }
      isQuitting = true;
      app.exit(0);
      return;
    }
    if (process.argv.includes('--open-test')) {""")
p.write_text(s, encoding="utf-8")
print("ok")
