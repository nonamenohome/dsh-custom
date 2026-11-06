import json, os, shutil, subprocess, time
from pathlib import Path
prof = Path(r"D:\QYD\dsh-file\.cache\qp-hk3")
shutil.rmtree(prof, ignore_errors=True); prof.mkdir(parents=True, exist_ok=True)
shutil.copy2(r"D:\QYD\Tools\QuickPie\PortableData\data.json", prof/"data.json")
env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
env["ELECTRON_ENABLE_LOGGING"] = "1"
subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
time.sleep(1)
exe = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
p = subprocess.Popen([exe, f"--user-data-dir={prof}", "--no-sandbox"], cwd=str(Path(exe).parent),
                     env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
time.sleep(9)
p.terminate()
try:
    out = p.communicate(timeout=8)[0]
except Exception:
    out = b""
text = out.decode("utf-8", "replace")
hits = [l for l in text.splitlines() if "hotkey" in l.lower() or "快捷键" in l]
print("命中行数:", len(hits))
for l in hits[:6]:
    print("LOG:", l.strip()[:200])
