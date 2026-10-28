import json, base64
from pathlib import Path
p = Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
d = json.loads(p.read_text(encoding="utf-8"))
rows = []
def walk(items):
    for it in items:
        ic = it.get("icon") or ""
        if ic.startswith("data:"):
            head, b64 = ic.split(",", 1)
            mime = head[5:].split(";")[0]
            try:
                raw = base64.b64decode(b64, validate=False)
            except Exception as e:
                raw = b""
            magic = raw[:4]
            kind = "PNG" if raw[:8] == b"\x89PNG\r\n\x1a\n" else ("ICO" if magic[:4] == b"\x00\x00\x01\x00" else ("JPEG" if magic[:2] == b"\xff\xd8" else "??"))
            rows.append((it["name"], mime, len(raw), kind))
        walk(it.get("children") or [])
walk(d["items"])
for r in rows[:25]:
    print(f'{r[0][:14]:<16} {r[1]:<14} {r[2]:>7} 字节  {r[3]}')
bad = [r for r in rows if r[3] != "PNG"]
print("非 PNG 的:", len(bad))
