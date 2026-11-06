import json, time
from pathlib import Path
p = Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
d = json.loads(p.read_text(encoding="utf-8"))
DING = r"D:\DingDing\main\current_new\DingTalk.exe"
grp = next((it for it in d["items"] if it.get("name") == "钉钉"), None)
if grp is None:
    grp = {"id":"grp-dingtalk","type":"group","name":"钉钉","target":DING,"args":"","icon":None,
           "children":[],"createdAt":int(time.time()*1000)}
    d["items"].append(grp)

exists = any(k.get("query") in ("刘羽佳", "liuyujia") for k in grp.get("children") or [])
if not exists:
    grp["children"].append({
        "id": "chat-lyj", "type": "chat", "name": "刘羽佳",
        "query": "刘羽佳", "platform": "dingtalk", "target": DING,
        "args": "", "icon": None, "hotkey": "",
        "createdAt": int(time.time()*1000),
    })
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
    print("已添加: 刘羽佳（钉钉会话）")
else:
    print("已存在")

print("\n钉钉分组:")
for k in grp["children"]:
    print(f'  {k["type"]:<5} {k["name"]}  query={k.get("query")!r} platform={k.get("platform")} hotkey={k.get("hotkey")!r}')
