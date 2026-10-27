import json, pathlib, shutil, time, os

p = pathlib.Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
stamp = time.strftime("%Y%m%d-%H%M%S")
backup = p.with_name(f"data.backup-{stamp}.json")
shutil.copy2(p, backup)
print("备份:", backup.name)

d = json.loads(p.read_text(encoding="utf-8"))
items = d["items"]
by_name = {it["name"]: it for it in items}

edge = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not os.path.exists(edge):
    edge = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"

def take(*names):
    out = []
    for n in names:
        for key in list(by_name):
            if key == n:
                out.append(by_name.pop(key))
    return out

folders = take("下载", "工作区", "常用工具路径")
urls = take("GitHub", "哔哩哔哩")

print("文件夹组子项:", [f["name"] for f in folders])
print("网址组子项:", [u["name"] for u in urls])

group_folders = {
    "id": "grp-folders",
    "type": "group",
    "name": "文件夹",
    "target": "C:\\",
    "args": "",
    "icon": None,
    "children": folders,
    "createdAt": int(time.time() * 1000),
}
group_urls = {
    "id": "grp-urls",
    "type": "group",
    "name": "网址",
    "target": edge,
    "args": "",
    "icon": None,
    "children": urls,
    "createdAt": int(time.time() * 1000),
}

rest = [by_name[k] for k in by_name]
d["items"] = [group_folders, group_urls] + rest
p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")

print("\n新的顶层:")
for it in d["items"]:
    kids = len(it.get("children") or [])
    print(f'  {it["type"]:<6} {it["name"]:<10} {it["target"]}' + (f'  (二级 {kids})' if kids else ""))
