import json, os, shutil, subprocess, time, ctypes
from pathlib import Path
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
prof = Path(r"D:\QYD\dsh-file\.cache\qp-ding-group")
shutil.rmtree(prof, ignore_errors=True); prof.mkdir(parents=True, exist_ok=True)
shutil.copy2(r"D:\QYD\Tools\QuickPie\PortableData\data.json", prof/"data.json")
d = json.loads((prof/"data.json").read_text(encoding="utf-8"))
idx = next(i for i, it in enumerate(d["items"]) if it.get("name") == "钉钉")
print("钉钉分组 index:", idx, "target:", d["items"][idx]["target"])

def fg():
    h = u.GetForegroundWindow(); b = ctypes.create_unicode_buffer(256)
    u.GetWindowTextW(h, b, 256)
    return "".join(c for c in b.value if 32 <= ord(c) < 127)

subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
time.sleep(1)
env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
exe = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
print("点击前前台:", repr(fg()))
subprocess.run([exe, f"--open-item={idx}", f"--user-data-dir={prof}", "--no-sandbox"],
               env=env, cwd=str(Path(exe).parent), capture_output=True, timeout=90)
time.sleep(3)
print("点击后前台:", repr(fg()))
log = prof/"open.log"
print("--- open.log ---")
print(log.read_text(encoding="utf-8") if log.exists() else "(无)")
