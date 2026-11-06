import json, time
from pathlib import Path
p = Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
d = json.loads(p.read_text(encoding="utf-8"))
rows = []
def walk(lst, parent=""):
    for it in lst:
        rows.append((it.get("createdAt") or 0, it, parent))
        walk(it.get("children") or [], it.get("name"))
walk(d["items"])
rows.sort(key=lambda x: -x[0])
print("最近 8 条:")
for ts, it, parent in rows[:8]:
    when = time.strftime("%m-%d %H:%M", time.localtime(ts/1000)) if ts else "?"
    print(f'  {when} | {it["type"]:<6} | {it["name"][:14]:<16} | target={it.get("target")!r:30} | query={it.get("query")!r} | in={parent}')
print()
g = next((it for it in d["items"] if it.get("name") == "微信"), None)
if g:
    print("微信分组 children:")
    for k in g.get("children") or []:
        print(f'  type={k["type"]:<6} name={k["name"]!r} target={k.get("target")!r} query={k.get("query")!r}')
else:
    print("没有微信分组")
