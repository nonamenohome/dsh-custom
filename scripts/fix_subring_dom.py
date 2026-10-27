import pathlib

w = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\wheel.js")
s = w.read_text(encoding="utf-8")
# 1) render() 清空 SVG 后把子环挂回去
s = s.replace("""    ring.innerHTML = '';
    slotsEl.innerHTML = '';""",
"""    ring.innerHTML = '';
    ring.appendChild(subRing);   // render 会清空整个 SVG，子环要挂回去
    slotsEl.innerHTML = '';
""", 1)
# 2) 去掉调试输出
s = s.replace("""    subRing.classList.add('is-on');
    hubSub.textContent += ` [sub:${subRing.childElementCount}]`;""",
"""    subRing.classList.add('is-on');""")
w.write_text(s, encoding="utf-8")

c = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\styles.css")
cs = c.read_text(encoding="utf-8")
cs = cs.replace(""".sub-ring path.sub-sector {
  fill: #ff0000;""",
""".sub-ring path.sub-sector {
  fill: var(--sector);""")
c.write_text(cs, encoding="utf-8")
print("ok")
