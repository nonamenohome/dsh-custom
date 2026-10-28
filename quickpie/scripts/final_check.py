import ctypes, os, subprocess, time
from pathlib import Path
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
w, h = u.GetSystemMetrics(0), u.GetSystemMetrics(1)
cx, cy = w // 2, h // 2

exe = r"D:\QYD\dsh-file\apps\quickpie\dist\QuickPie\QuickPie.exe"
base = Path(exe).parent
subprocess.run(["taskkill", "/F", "/IM", "QuickPie.exe"], capture_output=True)
time.sleep(1.0)
u.SetCursorPos(cx, cy); time.sleep(0.3)

env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
p = subprocess.Popen([exe, f"--user-data-dir={base}\\PortableData", "--no-sandbox"],
                     cwd=str(base), env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(5.0)
print("alive:", p.poll() is None)
from PIL import ImageGrab
ImageGrab.grab(bbox=(cx-500, cy-500, cx+500, cy+500), all_screens=True).resize((600,600)).save(
    r"D:\QYD\dsh-file\apps\quickpie\docs\final.png")
print("shot ok")
p.terminate()
