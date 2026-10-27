import json, os, shutil, subprocess, time
from pathlib import Path
src = Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
prof = Path(r"D:\QYD\dsh-file\.cache\qp-iconfix3")
shutil.rmtree(prof, ignore_errors=True); prof.mkdir(parents=True, exist_ok=True)
d = json.loads(src.read_text(encoding="utf-8"))
def clear(items):
    for it in items:
        if it["type"] != "url": it["icon"] = None
        clear(it.get("children") or [])
clear(d["items"])
(prof / "data.json").write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")

env = dict(os.environ)
env.pop("ELECTRON_RUN_AS_NODE", None)
env["ELECTRON_ENABLE_LOGGING"] = "1"
p = subprocess.Popen([r"D:\QYD\Tools\QuickPie\QuickPie.exe", f"--user-data-dir={prof}", "--no-sandbox"],
                     stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, env=env)
time.sleep(25)
print("alive:", p.poll() is None)
if p.poll() is None:
    p.terminate()
try:
    out, _ = p.communicate(timeout=10)
except Exception:
    out = ""
lines = [l for l in (out or "").splitlines() if any(k in l for k in ("Error", "error", "Uncaught", "reject"))]
print("错误行数:", len(lines))
for l in lines[:6]: print("  ", l[:160])

d2 = json.loads((prof / "data.json").read_text(encoding="utf-8"))
miss = []
def walk(items):
    for it in items:
        if not it.get("icon"): miss.append(it["name"])
        walk(it.get("children") or [])
walk(d2["items"])
print("缺图标:", len(miss), miss[:8])
