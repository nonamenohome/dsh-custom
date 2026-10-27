import json, pathlib

p = pathlib.Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
d = json.loads(p.read_text(encoding="utf-8"))
items = d["items"]
group = next(it for it in items if it["id"] == "grp-folders")

# 把剩下那个指向目录的条目也放进文件夹组（按 target 认，不按名字）
moved = []
keep = []
for it in items:
    if it is group:
        keep.append(it); continue
    if it.get("target", "").lower().startswith("d:\\qyd\\text2video"):
        if it["type"] == "file":
            it["type"] = "folder"          # 它其实是目录
        moved.append(it)
    else:
        keep.append(it)

group["children"] = (group.get("children") or []) + moved
d["items"] = keep
p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")

print("移入:", [m["name"] for m in moved])
print("\n最终结构:")
for it in d["items"]:
    print(f'  {it["type"]:<6} {it["name"]:<10} {it["target"]}')
    for k in it.get("children") or []:
        print(f'      └ {k["type"]:<6} {k["name"]:<12} {k["target"]}')
