import json
from pathlib import Path
p = Path(r"D:\QYD\dsh-file\.cache\qp-iconfix\data.json")
d = json.loads(p.read_text(encoding="utf-8"))
total = ok = 0
def walk(items, depth=0):
    global total, ok
    for it in items:
        total += 1
        if it.get("icon"): ok += 1
        else: print("  NO ICON:", it["name"], it["type"])
        if it.get("children"): walk(it["children"], depth+1)
walk(d["items"])
print(f"有图标 {ok}/{total}")
