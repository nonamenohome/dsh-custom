import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\index.html")
s = p.read_text(encoding="utf-8")
s = s.replace('src="../build/icon.png"', 'src="logo.png"')
p.write_text(s, encoding="utf-8")
print("html src -> logo.png")
