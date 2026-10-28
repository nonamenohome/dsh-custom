import pathlib, re
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\styles.css")
s = p.read_text(encoding="utf-8")
s = s.replace("rgba(40, 30, 16,", "rgba(16, 16, 18,")
s = s.replace("rgba(46, 36, 22,", "rgba(16, 16, 18,")
p.write_text(s, encoding="utf-8")
print("暖色阴影已中性化")
