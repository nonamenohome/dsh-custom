import base64, json
from pathlib import Path

# 1) 把图标写进用户数据（现有会话条目立刻有图标）
icon_path = Path(r"D:\QYD\dsh-file\apps\quickpie\app\wechat-icon.png")
data_url = "data:image/png;base64," + base64.b64encode(icon_path.read_bytes()).decode()

p = Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
d = json.loads(p.read_text(encoding="utf-8"))
n = 0
for it in d["items"]:
    if it.get("type") in ("chat", "wechat") and not (it.get("icon") or "").startswith("data:"):
        it["icon"] = data_url
        n += 1
p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
print("写入图标条目数:", n)

# 2) main.js 增加内置图标兜底
m = Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = m.read_text(encoding="utf-8")
s = s.replace("""  for (const p of candidates) {
    const icon = await iconViaPowerShell(p);
    if (icon) return icon;
  }
  return null;""",
"""  for (const p of candidates) {
    const icon = await iconViaPowerShell(p);
    if (icon) return icon;
  }

  // 会话类条目兜底：用内置的微信图标，避免显示成字母牌
  if (type === 'chat' || type === 'wechat') {
    try {
      const bundled = path.join(ROOT, 'app', 'wechat-icon.png');
      if (fs.existsSync(bundled)) {
        return `data:image/png;base64,${fs.readFileSync(bundled).toString('base64')}`;
      }
    } catch (_) { /* ignore */ }
  }
  return null;""")
m.write_text(s, encoding="utf-8")
print("resolveIcon 兜底已加")
