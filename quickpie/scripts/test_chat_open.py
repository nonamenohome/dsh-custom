import json, os, shutil, subprocess, time
from pathlib import Path
prof = Path(r"D:\QYD\dsh-file\.cache\qp-chat-open")
shutil.rmtree(prof, ignore_errors=True); prof.mkdir(parents=True, exist_ok=True)
src = Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
shutil.copy2(src, prof/"data.json")
d = json.loads((prof/"data.json").read_text(encoding="utf-8"))
idx = next(i for i, it in enumerate(d["items"]) if it.get("type") == "chat")
print("测试条目 index:", idx, d["items"][idx]["name"], "target=", repr(d["items"][idx]["target"]))

env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
exe = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
time.sleep(1)
r = subprocess.run([exe, f"--open-item={idx}", f"--user-data-dir={prof}", "--no-sandbox"],
                   env=env, cwd=str(Path(exe).parent), capture_output=True, timeout=90)
time.sleep(2)
log = prof/"open.log"
print("--- open.log ---")
print(log.read_text(encoding="utf-8") if log.exists() else "(无)")
