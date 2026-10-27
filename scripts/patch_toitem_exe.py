import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""    args: String(raw.args || ''),
    icon: raw.icon || null,""",
"""    args: String(raw.args || ''),
    exe: raw.exe || null,
    icon: raw.icon || null,""")
p.write_text(s, encoding="utf-8")
print("ok")
