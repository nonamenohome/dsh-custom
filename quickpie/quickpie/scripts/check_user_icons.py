import json, base64
from pathlib import Path
p = Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
print("大小:", p.stat().st_size, "字节", "修改:", p.stat().st_mtime)
d = json.loads(p.read_text(encoding="utf-8"))
no = []
cnt = 0
def walk(items, parent=""):
    global cnt
    for it in items:
        cnt += 1
        ic = it.get("icon") or ""
        ok = ic.startswith("data:") and len(ic) > 200
        if not ok:
            no.append((it["name"], it["type"], (it.get("target") or "")[:70], len(ic)))
        walk(it.get("children") or [], it["name"])
walk(d["items"])
print("条目总数:", cnt, "无图标:", len(no))
for n in no:
    print("   ", n)
