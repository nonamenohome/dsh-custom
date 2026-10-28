import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
s = s.replace("await wait(2600);", "await wait(4000);")
s = s.replace("""    items: state.items.length,""",
"""    items: state.items.length,
    winCache: winCache.size,
    demoIndex,""")
p.write_text(s, encoding="utf-8")
print("ok")
