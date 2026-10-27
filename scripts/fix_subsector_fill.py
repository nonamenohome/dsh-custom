import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\styles.css")
s = p.read_text(encoding="utf-8")
# 实色 token
s = s.replace("  --sector:       rgba(255, 255, 255, .965);",
              "  --sector:       rgba(255, 255, 255, .965);\n  --sector-solid: #ffffff;")
s = s.replace("  --sector:       rgba(36, 36, 39, .965);",
              "  --sector:       rgba(36, 36, 39, .965);\n  --sector-solid: #242427;")
# 二级用实色
s = s.replace(""".sub-ring path.sub-sector {
  fill: var(--sector);""",
""".sub-ring path.sub-sector {
  fill: var(--sector-solid);""")
p.write_text(s, encoding="utf-8")
print("ok")
