import json, pathlib
p = pathlib.Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
d = json.loads(p.read_text(encoding="utf-8"))
before = len(d["items"])
d["items"] = [it for it in d["items"] if "quickpie-test" not in it.get("target", "")]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"清理测试条目: {before} -> {len(d['items'])}")
print("现有条目:", [it["name"] for it in d["items"]])
