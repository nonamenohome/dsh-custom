import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\styles.css")
s = p.read_text(encoding="utf-8")
s = s.replace("""  background: rgba(255, 253, 248, .97);""",
"""  background: color-mix(in srgb, var(--surface) 97%, transparent);""")
p.write_text(s, encoding="utf-8")
print("chip 背景改为跟随主题")
