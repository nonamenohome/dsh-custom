import json, pathlib, shutil, time
p = pathlib.Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
shutil.copy2(p, p.with_name(f"data.backup-{time.strftime('%Y%m%d-%H%M%S')}.json"))
d = json.loads(p.read_text(encoding="utf-8"))
print("修改前:")
for it in d["items"]:
    print(f'  {it["type"]:<6} {it["name"]:<12} {it.get("target","")[:50]}')

WECHAT = r"D:\Weixin\Weixin.exe"

# 已存在的微信分组就复用
group = next((it for it in d["items"] if it.get("type") == "group" and it.get("name") == "微信"), None)
if group is None:
    group = {
        "id": "grp-wechat", "type": "group", "name": "微信", "target": WECHAT,
        "args": "", "icon": None, "children": [],
        "createdAt": int(time.time() * 1000),
    }
    d["items"].insert(0, group)

# 把现有会话条目移进分组
moved = []
rest = []
for it in d["items"]:
    if it is group:
        rest.append(it); continue
    if it.get("type") == "chat":
        moved.append(it)
    else:
        rest.append(it)
group["children"] = (group.get("children") or []) + moved
d["items"] = rest
p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")

print("\n修改后:")
for it in d["items"]:
    print(f'  {it["type"]:<6} {it["name"]:<12} {it.get("target","")[:50]}')
    for k in it.get("children") or []:
        print(f'      └ {k["type"]:<5} {k["name"]}')
