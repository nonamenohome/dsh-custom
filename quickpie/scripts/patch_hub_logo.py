import pathlib

# 1) index.html：中心加 logo
h = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\index.html")
s = h.read_text(encoding="utf-8")
s = s.replace("""          <div class="hub-eyebrow" id="hubEyebrow">QUICKPIE</div>""",
"""          <img class="hub-logo" id="hubLogo" src="../build/icon.png" alt="" />
          <div class="hub-eyebrow" id="hubEyebrow">QUICKPIE</div>""")
h.write_text(s, encoding="utf-8")

# 2) wheel.js：空闲时显示 logo，悬停时隐藏
w = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\wheel.js")
ws = w.read_text(encoding="utf-8")
ws = ws.replace("""  function updateHubDefault() {
    const total = S.items.length;
    hubEyebrow.textContent = 'QUICKPIE';""",
"""  function updateHubDefault() {
    const total = S.items.length;
    hubRoot.classList.add('is-idle');
    hubEyebrow.textContent = '';""")
ws = ws.replace("""    hubEyebrow.textContent = TYPE_LABEL[item.type] || '条目';""",
"""    hubRoot.classList.remove('is-idle');
    hubEyebrow.textContent = TYPE_LABEL[item.type] || '条目';""")
w.write_text(ws, encoding="utf-8")

# 3) 找到 hub 容器变量名
import re
m = re.search(r"const (hub\w*) = document\.getElementById\('wheelHub'\)", ws)
print("hub 变量:", m.group(1) if m else "未找到")
