import pathlib
c = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\styles.css")
s = c.read_text(encoding="utf-8")
s = s.replace(""".sub-ring path.sub-sector {
  fill: var(--sector);""",
""".sub-ring path.sub-sector {
  fill: #ff0000;""")
c.write_text(s, encoding="utf-8")
print("临时红色")
