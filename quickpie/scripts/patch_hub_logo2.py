import pathlib
w = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\wheel.js")
s = w.read_text(encoding="utf-8")
s = s.replace("hubRoot.classList.add('is-idle');", "hub.classList.add('is-idle');")
s = s.replace("hubRoot.classList.remove('is-idle');", "hub.classList.remove('is-idle');")
w.write_text(s, encoding="utf-8")

c = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\styles.css")
cs = c.read_text(encoding="utf-8")
cs += """
/* 空闲态：中心显示应用图标 */
.hub-logo {
  display: none;
  width: 86px;
  height: 86px;
  border-radius: 22%;
  margin: 0 auto 12px;
  object-fit: contain;
  filter: drop-shadow(0 6px 14px rgba(16, 16, 18, .18));
}
.wheel-hub.is-idle .hub-logo { display: block; }
.wheel-hub.is-idle .hub-eyebrow { display: none; }
.wheel-hub.is-idle .hub-title { font-size: 20px; }
"""
c.write_text(cs, encoding="utf-8")
print("ok")
