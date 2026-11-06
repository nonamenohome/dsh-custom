import json, os, shutil, subprocess, time
from pathlib import Path
prof = Path(r"D:\QYD\dsh-file\.cache\qp-hk2")
shutil.rmtree(prof, ignore_errors=True); prof.mkdir(parents=True, exist_ok=True)
shutil.copy2(r"D:\QYD\Tools\QuickPie\PortableData\data.json", prof/"data.json")
d = json.loads((prof/"data.json").read_text(encoding="utf-8"))
hk = [(k["name"], k.get("hotkey")) for it in d["items"] for k in (it.get("children") or []) if k.get("hotkey")]
print("数据里的条目快捷键:", hk)

env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
env["ELECTRON_ENABLE_LOGGING"] = "1"
subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
time.sleep(1)
exe = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
p = subprocess.Popen([exe, f"--user-data-dir={prof}", "--no-sandbox"], cwd=str(Path(exe).parent),
                     env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
time.sleep(9)
p.terminate()
try:
    out, _ = p.communicate(timeout=8)
except Exception:
    out = ""
for line in (out or "").splitlines():
    if "hotkey" in line.lower() or "快捷键" in line:
        print("LOG:", line.strip()[:160])
