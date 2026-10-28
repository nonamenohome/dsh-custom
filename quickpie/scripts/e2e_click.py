import ctypes, math, os, subprocess, time
from pathlib import Path

ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
w, h = u.GetSystemMetrics(0), u.GetSystemMetrics(1)
cx, cy = w // 2, h // 2

exe = r"D:\QYD\dsh-file\apps\quickpie\dist\QuickPie\QuickPie.exe"
base = Path(exe).parent
data = base / "PortableData"
log = data / "open.log"
if log.exists():
    log.unlink()

subprocess.run(["taskkill", "/F", "/IM", "QuickPie.exe"], capture_output=True)
time.sleep(1.0)
u.SetCursorPos(cx, cy)
time.sleep(0.3)

env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
p = subprocess.Popen([exe, f"--user-data-dir={data}", "--no-sandbox"],
                     cwd=str(base), env=env,
                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(5.5)
print("alive:", p.poll() is None)

u.SetCursorPos(cx, cy - 380)   # 正上方 = 第一项（桌面）
time.sleep(0.5)
u.mouse_event(0x0002, 0, 0, 0, 0); time.sleep(0.1); u.mouse_event(0x0004, 0, 0, 0, 0)
print("clicked top slot")
time.sleep(2.5)

print("--- open.log ---")
print(log.read_text(encoding="utf-8") if log.exists() else "(无日志)")

p.terminate()
