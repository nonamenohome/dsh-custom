import json
from pathlib import Path
p = Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
d = json.loads(p.read_text(encoding="utf-8"))
g = next(it for it in d["items"] if it.get("name") == "微信")
for k in g.get("children") or []:
    print("---")
    print("type :", k.get("type"))
    print("name :", repr(k.get("name")))
    print("target:", repr(k.get("target")))
    print("codes:", [hex(ord(c)) for c in (k.get("target") or "")][:20])
