import json
from pathlib import Path
p = Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
d = json.loads(p.read_text(encoding="utf-8"))
g = next(it for it in d["items"] if it["name"] == "微信")
print("微信分组:")
for k in ["type","name","target","icon"]:
    v = g.get(k)
    print(f'  {k} = {repr(v)[:80]}')
print("  子项:")
for k in g.get("children") or []:
    print("   ", {kk: (kk in ("icon",) and ("有" if k.get(kk) else "无")) or k.get(kk) for kk in ("id","type","name","target","query","icon")})
print("\n全库 chat 类型条目数:", sum(1 for it in d["items"] for _ in [0] if it.get("type")=="chat") + sum(1 for it in d["items"] for k in (it.get("children") or []) if k.get("type")=="chat"))
