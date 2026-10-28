import json, pathlib
p = pathlib.Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
d = json.loads(p.read_text(encoding="utf-8"))
for i, it in enumerate(d["items"]):
    kids = len(it.get("children") or [])
    print(f'{i}: {it["type"]:<6} {it["name"]:<12} {it["target"]}' + (f'  (子项 {kids})' if kids else ""))
