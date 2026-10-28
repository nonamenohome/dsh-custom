import json, pathlib
p = pathlib.Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
d = json.loads(p.read_text(encoding="utf-8"))
for it in d["items"]:
    kids = it.get("children") or []
    print(f'{it["name"]}: icon={"有" if it.get("icon") else "无"}  子项={len(kids)}')
    for k in kids:
        print(f'   {k["name"]}: icon={"有" if k.get("icon") else "无"}')
