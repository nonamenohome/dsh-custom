import pathlib
c = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\styles.css")
s = c.read_text(encoding="utf-8")
s = s.replace("""  width: 236px;
  height: 236px;
  margin: -118px 0 0 -118px;""",
"""  width: 272px;
  height: 272px;
  margin: -136px 0 0 -136px;""")
c.write_text(s, encoding="utf-8")
print("hub 272px")
