import json, pathlib, shutil, time
p = pathlib.Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
shutil.copy2(p, p.with_name(f"data.backup-{time.strftime('%Y%m%d-%H%M%S')}.json"))
d = json.loads(p.read_text(encoding="utf-8"))
fixed = []
for it in d["items"]:
    for k in (it.get("children") or []):
        if k.get("type") in ("file", "folder") and "/" not in k.get("target","") and "\\" not in k.get("target","") and ":" not in k.get("target",""):
            k["type"] = "chat"
            k["query"] = k.get("name") or k.get("target")
            k["target"] = ""
            k["icon"] = None
            fixed.append(k["name"])
p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
print("已转为会话条目:", fixed)
