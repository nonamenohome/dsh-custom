import base64, json
from pathlib import Path
p = Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
d = json.loads(p.read_text(encoding="utf-8"))
out = Path(r"D:\QYD\Tools\icons"); out.mkdir(parents=True, exist_ok=True)
def walk(items):
    for it in items:
        ic = it.get("icon") or ""
        if ic.startswith("data:image/png;base64,") and len(ic) > 5000:
            raw = base64.b64decode(ic.split(",",1)[1])
            if raw[:8] == b"\x89PNG\r\n\x1a\n":
                name = "".join(ch for ch in it["name"] if ch.isalnum() or ch in "-_") or it["id"]
                (out / f"{name}.png").write_bytes(raw)
                print(f'{it["name"]}: PNG {len(raw)} 字节 -> {name}.png')
        walk(it.get("children") or [])
walk(d["items"])
