import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\wheel.js")
s = p.read_text(encoding="utf-8")
# 子项胶囊不设 title（原生 tooltip 会盖住胶囊），窗口胶囊保留
s = s.replace("""      chip.title = entry.title || entry.label;""",
"""      if (entry.keepTitle) chip.title = entry.title || entry.label;""")
s = s.replace("""      list.slice(0, 6).map((win) => ({ label: win.t, title: win.t, win })),""",
"""      list.slice(0, 6).map((win) => ({ label: win.t, title: win.t, win, keepTitle: true })),""")
p.write_text(s, encoding="utf-8")
print("ok")
