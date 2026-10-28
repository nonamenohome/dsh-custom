import ctypes, json, math, os, subprocess, time
from pathlib import Path
from PIL import ImageGrab

ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
w, h = u.GetSystemMetrics(0), u.GetSystemMetrics(1)
cx, cy = w // 2, h // 2

exe = r"D:\QYD\dsh-file\apps\quickpie\dist\QuickPie\QuickPie.exe"
base = Path(exe).parent
data = base / "PortableData"
log = data / "open.log"
if log.exists(): log.unlink()

subprocess.run(["taskkill", "/F", "/IM", "QuickPie.exe"], capture_output=True)
time.sleep(1.2)
u.SetCursorPos(cx, cy); time.sleep(0.4)

env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
p = subprocess.Popen([exe, f"--user-data-dir={data}", "--no-sandbox"],
                     cwd=str(base), env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(5.0)

ImageGrab.grab(bbox=(cx-500, cy-500, cx+500, cy+500), all_screens=True).resize((500,500)).save(
    r"D:\QYD\dsh-file\.cache\rs-shots\before_click.png")

u.SetCursorPos(cx, cy - 380); time.sleep(0.8)
ImageGrab.grab(bbox=(cx-500, cy-500, cx+500, cy+500), all_screens=True).resize((500,500)).save(
    r"D:\QYD\dsh-file\.cache\rs-shots\hover_top.png")
u.mouse_event(0x0002, 0, 0, 0, 0); time.sleep(0.1); u.mouse_event(0x0004, 0, 0, 0, 0)
time.sleep(3.0)
print("--- open.log ---")
print(log.read_text(encoding="utf-8") if log.exists() else "(无日志)")
p.terminate()
