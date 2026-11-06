import json, os, shutil, subprocess, time
from pathlib import Path
import ctypes
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32

# 复制一份 profile 测试，避免动你正在用的数据
prof = Path(r"D:\QYD\dsh-file\.cache\qp-hotkey-test")
shutil.rmtree(prof, ignore_errors=True); prof.mkdir(parents=True, exist_ok=True)
shutil.copy2(r"D:\QYD\Tools\QuickPie\PortableData\data.json", prof/"data.json")
log = prof / "open.log"
if log.exists(): log.unlink()

env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
time.sleep(1)
exe = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
p = subprocess.Popen([exe, f"--user-data-dir={prof}", "--no-sandbox"], cwd=str(Path(exe).parent),
                     env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(8)
print("启动:", p.poll() is None)

# 模拟 Ctrl+Alt+1
u.keybd_event(0x11,0,0,0); u.keybd_event(0x12,0,0,0); u.keybd_event(0x31,0,0,0)
time.sleep(0.08)
u.keybd_event(0x31,0,2,0); u.keybd_event(0x12,0,2,0); u.keybd_event(0x11,0,2,0)
time.sleep(4)

print("--- open.log ---")
print(log.read_text(encoding="utf-8") if log.exists() else "(无记录)")
p.terminate()
