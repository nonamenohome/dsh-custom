import json
from pathlib import Path
p = Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
d = json.loads(p.read_text(encoding="utf-8"))
print("=== 顶层结构 ===")
for it in d["items"]:
    kids = it.get("children") or []
    print(f'{it["type"]:<6} {it["name"]:<10} target={ (it.get("target") or "")[:40] }' + (f'  二级{len(kids)}' if kids else ""))
    for k in kids:
        extra = f'  query={k.get("query")}' if k.get("type") == "chat" else ""
        print(f'    └ {k["type"]:<5} {k["name"]:<10}{extra}')

print("\n=== 会话条目明细 ===")
def walk(items):
    for it in items:
        if it.get("type") in ("chat", "wechat"):
            print(f'  {it["name"]} | query={it.get("query")!r} | target={it.get("target")!r} | 图标={"有" if (it.get("icon") or "").startswith("data:") else "无"}')
        walk(it.get("children") or [])
walk(d["items"])
