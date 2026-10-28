import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""    if (firstRun) createManagerWindow();""",
"""    // 启动即弹一次轮盘：双击后立刻有反馈（数据已存在时不会再开管理器窗口）
    if (firstRun) {
      createManagerWindow();
    } else if (!SHOT) {
      setTimeout(() => { try { showWheel(); } catch (_) {} }, 400);
    }""")
p.write_text(s, encoding="utf-8")
print("ok")
