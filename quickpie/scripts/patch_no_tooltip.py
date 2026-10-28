import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\wheel.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""      slot.title = `${item.name}\\n${item.target}`;""",
"""      // 不设 title：原生 tooltip 会飘在轮盘上盖住二级胶囊，中心已经把名字和路径显示全了
      slot.removeAttribute('title');""")
p.write_text(s, encoding="utf-8")
print("ok")
