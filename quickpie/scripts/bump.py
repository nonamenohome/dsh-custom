import json, pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\package.json")
d = json.loads(p.read_text(encoding="utf-8"))
d["version"] = "0.2.1"
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("version ->", d["version"])
