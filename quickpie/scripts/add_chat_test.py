import json, pathlib, time
p = pathlib.Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
d = json.loads(p.read_text(encoding="utf-8"))
exists = any(it.get("type") == "chat" and it.get("query") == "张博文" for it in d["items"])
if not exists:
    d["items"].insert(0, {
        "id": "chat-zbw", "type": "chat", "name": "张博文", "target": "",
        "args": "", "query": "张博文", "icon": None,
        "createdAt": int(time.time()*1000), "children": [],
    })
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
    print("已插入测试条目: 张博文（目标留空）")
else:
    print("已存在 张博文 会话条目")
print("chat 类型条目:", [it["name"] for it in d["items"] if it.get("type") == "chat"])
