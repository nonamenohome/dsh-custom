import json, time
from pathlib import Path
p = Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
d = json.loads(p.read_text(encoding="utf-8"))
items = []
def walk(lst, parent=""):
    for it in lst:
        items.append((it.get("createdAt") or 0, it, parent))
        walk(it.get("children") or [], it.get("name"))
walk(d["items"])
items.sort(key=lambda x: -x[0])
for ts, it, parent in items[:6]:
    when = time.strftime("%m-%d %H:%M:%S", time.localtime(ts/1000)) if ts else "?"
    print(f'{when}  {it["type"]:<6} {it["name"]:<16} target={it.get("target")!r} query={it.get("query")!r} parent={parent}')
