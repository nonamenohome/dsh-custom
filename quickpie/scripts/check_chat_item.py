import json
from pathlib import Path
d = json.loads(Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json").read_text(encoding="utf-8"))
for it in d["items"]:
    if it.get("type") == "chat":
        print(it["name"], "icon_len=", len(it.get("icon") or ""), "target=", repr(it.get("target")), "query=", it.get("query"))
