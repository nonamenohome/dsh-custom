import json, time
from pathlib import Path
p = Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
d = json.loads(p.read_text(encoding="utf-8"))
DING = r"D:\DingDing\main\current_new\DingTalk.exe"

# 从微信组里取出钉钉那条
wx = next((it for it in d["items"] if it.get("name") == "微信"), None)
moved = []
if wx:
    keep = []
    for k in wx.get("children") or []:
        if k.get("platform") == "dingtalk" or "dingtalk" in (k.get("target") or "").lower():
            moved.append(k)
        else:
            keep.append(k)
    wx["children"] = keep

# 建/复用「钉钉」分组
grp = next((it for it in d["items"] if it.get("name") == "钉钉"), None)
if grp is None:
    grp = {"id":"grp-dingtalk","type":"group","name":"钉钉","target":DING,"args":"","icon":None,
           "children":[],"createdAt":int(time.time()*1000)}
    d["items"].append(grp)
grp["children"] = (grp.get("children") or []) + moved
p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")

print("顶层:")
for it in d["items"]:
    print(f'  {it["type"]:<6} {it["name"]:<8} 二级={len(it.get("children") or [])}')
print("钉钉组内:")
for k in grp["children"]:
    print(f'  {k["type"]:<5} {k["name"]} hotkey={k.get("hotkey")} platform={k.get("platform")}')
