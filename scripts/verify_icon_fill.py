import json, os, shutil, subprocess, time
from pathlib import Path

prof = Path(r"D:\QYD\dsh-file\.cache\qp-addicon")
shutil.rmtree(prof, ignore_errors=True); prof.mkdir(parents=True, exist_ok=True)
shutil.copy2(r"D:\QYD\Tools\QuickPie\PortableData\data.json", prof/"data.json")

exe = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
time.sleep(1)
p = subprocess.Popen([exe, f"--user-data-dir={prof}", "--no-sandbox"], cwd=str(Path(exe).parent),
                     env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(8)
print("alive:", p.poll() is None)
p.terminate(); time.sleep(1.2)

d = json.loads((prof/"data.json").read_text(encoding="utf-8"))
missing = []
def walk(items):
    for it in items:
        if not (it.get("icon") or "").startswith("data:"):
            missing.append(it["name"])
        walk(it.get("children") or [])
walk(d["items"])
print("启动后仍缺图标:", missing if missing else "无")
