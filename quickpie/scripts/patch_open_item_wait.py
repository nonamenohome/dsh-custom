import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""      isQuitting = true;
      app.exit(0);
      return;
    }
    if (process.argv.includes('--open-test')) {""",
"""      // 留 6 秒给子进程真正把窗口画出来，再退出（否则 Electron 退出会带走子进程）
      await new Promise((r) => setTimeout(r, 6000));
      isQuitting = true;
      app.exit(0);
      return;
    }
    if (process.argv.includes('--open-test')) {""")
p.write_text(s, encoding="utf-8")
print("ok")
