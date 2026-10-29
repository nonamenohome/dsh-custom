import json, os, shutil, subprocess, time
from pathlib import Path
before = len([p for p in subprocess.run(["tasklist","/FI","IMAGENAME eq Weixin.exe"],capture_output=True,text=True).stdout.splitlines() if "Weixin" in p])
prof = Path(r"D:\QYD\dsh-file\.cache\qp-group-open")
shutil.rmtree(prof, ignore_errors=True); prof.mkdir(parents=True, exist_ok=True)
shutil.copy2(r"D:\QYD\Tools\QuickPie\PortableData\data.json", prof/"data.json")
d = json.loads((prof/"data.json").read_text(encoding="utf-8"))
idx = next(i for i, it in enumerate(d["items"]) if it.get("name") == "微信")
print("微信分组 index:", idx, "target:", d["items"][idx]["target"])
env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
time.sleep(1)
exe = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
subprocess.run([exe, f"--open-item={idx}", f"--user-data-dir={prof}", "--no-sandbox"],
               env=env, cwd=str(Path(exe).parent), capture_output=True, timeout=90)
time.sleep(2)
log = prof/"open.log"
print("--- open.log ---")
print(log.read_text(encoding="utf-8") if log.exists() else "(无)")
after = len([p for p in subprocess.run(["tasklist","/FI","IMAGENAME eq Weixin.exe"],capture_output=True,text=True).stdout.splitlines() if "Weixin" in p])
print(f"Weixin 进程数: {before} -> {after}")
