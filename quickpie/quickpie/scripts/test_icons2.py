import json, os, shutil, subprocess, time
from pathlib import Path

src = Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
prof = Path(r"D:\QYD\dsh-file\.cache\qp-iconfix2")
shutil.rmtree(prof, ignore_errors=True); prof.mkdir(parents=True, exist_ok=True)
d = json.loads(src.read_text(encoding="utf-8"))

def clear(items):
    for it in items:
        if it["type"] != "url":
            it["icon"] = None
        clear(it.get("children") or [])
clear(d["items"])
(prof / "data.json").write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")

exe = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
time.sleep(1)
p = subprocess.Popen([exe, f"--user-data-dir={prof}", "--no-sandbox"],
                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(45)
p.terminate(); time.sleep(1.5)

d2 = json.loads((prof / "data.json").read_text(encoding="utf-8"))
missing = []
total = [0]
def walk(items):
    for it in items:
        total[0] += 1
        if not it.get("icon"):
            missing.append((it["name"], it["type"], it["target"][:60]))
        walk(it.get("children") or [])
walk(d2["items"])
print(f"共 {total[0]} 项，缺图标 {len(missing)} 项")
for m in missing:
    print("  缺:", m[0], "|", m[1], "|", m[2])
