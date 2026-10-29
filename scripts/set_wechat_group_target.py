import json, pathlib
p = pathlib.Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
d = json.loads(p.read_text(encoding="utf-8"))
WECHAT = r"D:\Weixin\Weixin.exe"
for it in d["items"]:
    if it.get("type") == "group" and it.get("name") == "微信":
        it["target"] = WECHAT
        it["icon"] = None          # 让程序按目标重新抓图标
        print("已设置默认目标:", it["target"])
        print("二级条目:", [k["name"] for k in it.get("children") or []])
p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
print("\n顶层结构:")
for it in d["items"]:
    kids = len(it.get("children") or [])
    print(f'  {it["type"]:<6} {it["name"]:<8} {it.get("target","")[:55]}' + (f'  ({kids} 个二级)' if kids else ""))
