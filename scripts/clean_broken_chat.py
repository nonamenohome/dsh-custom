import json, base64
from pathlib import Path
p = Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
d = json.loads(p.read_text(encoding="utf-8"))
g = next(it for it in d["items"] if it.get("name") == "微信")
print("清理前:")
for k in g["children"]:
    print(f'  {k["type"]:<5} name={k["name"]!r}')
# 删掉那条 type=file 的坏数据
g["children"] = [k for k in g["children"] if not (k["type"] == "file" and not k.get("target","").count("\\"))]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
print("清理后:")
for k in g["children"]:
    print(f'  {k["type"]:<5} name={k["name"]!r} query={k.get("query")!r}')
