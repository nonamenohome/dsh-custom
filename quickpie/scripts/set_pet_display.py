import json, pathlib, io
p = pathlib.Path(r"C:\Users\quyuedi\.dsh\dsh-pet\main-config.jsonc")
raw = p.read_text(encoding="utf-8")
d = json.loads(raw)
print("改前 display =", d["pets"][0]["display"])
d["pets"][0]["display"] = "both"
# 写回（无 BOM），保持字段顺序
p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
print("改后 display =", json.loads(p.read_text(encoding='utf-8'))["pets"][0]["display"])
print("文件大小:", p.stat().st_size)
