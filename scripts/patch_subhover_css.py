import pathlib
c = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\styles.css")
s = c.read_text(encoding="utf-8")
s = s.replace(""".sub-ring path.sub-sector:hover { fill: var(--sector-hi); }""",
""".sub-ring path.sub-sector:hover,
.sub-ring path.sub-sector.is-hover { fill: var(--sector-hi); }""")
c.write_text(s, encoding="utf-8")
print("ok")
