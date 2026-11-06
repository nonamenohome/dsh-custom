import json
from pathlib import Path
p = Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
d = json.loads(p.read_text(encoding="utf-8"))
print("修改时间:", __import__("time").strftime("%Y-%m-%d %H:%M:%S", __import__("time").localtime(p.stat().st_mtime)))
for it in d["items"]:
    kids = it.get("children") or []
    print(f'{it["type"]:<6} {it["name"]:<10} target={(it.get("target") or "")[:45]} 二级={len(kids)}')
    for k in kids:
        if k.get("type") in ("chat","wechat"):
            print(f'    └ chat {k["name"]} query={k.get("query")!r}')
