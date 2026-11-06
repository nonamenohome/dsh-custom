import json, time
from pathlib import Path
p = Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
d = json.loads(p.read_text(encoding="utf-8"))
g = next((it for it in d["items"] if it.get("name") == "微信"), None)
if g is None:
    g = {"id":"grp-wechat","type":"group","name":"微信","target":r"D:\Weixin\Weixin.exe","args":"","icon":None,"children":[],"createdAt":int(time.time()*1000)}
    d["items"].insert(0, g)
kid = next((k for k in g["children"] if k.get("query") == "屈跃帝"), None)
if kid is None:
    kid = {"id":"chat-qyd","type":"chat","name":"屈跃帝(钉钉)","query":"屈跃帝","platform":"dingtalk",
           "target":r"D:\DingDing\main\current_new\DingTalk.exe","args":"","icon":None,
           "hotkey":"Control+Alt+1","createdAt":int(time.time()*1000)}
    g["children"].append(kid)
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
    print("已加测试条目: 屈跃帝(钉钉) platform=dingtalk hotkey=Control+Alt+1")
else:
    print("已存在")
