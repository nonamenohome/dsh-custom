import ctypes, subprocess, time, math
from pathlib import Path
from PIL import ImageGrab

ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
MON, UP = 0x0002, 0x0004

w, h = u.GetSystemMetrics(0), u.GetSystemMetrics(1)
cx, cy = w // 2, h // 2
u.SetCursorPos(cx, cy)
time.sleep(0.3)

exe = r"D:\QYD\dsh-file\apps\quickpie\dist\QuickPie\QuickPie.exe"
args = [exe, r"--user-data-dir=D:\QYD\dsh-file\apps\quickpie\dist\QuickPie\PortableData", "--no-sandbox"]
p = subprocess.Popen(args, cwd=str(Path(exe).parent), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(4.5)
print("alive:", p.poll() is None)

# 6 项 → 每项 60°；下载是第 2 项（index 1）
r = 380
ang = math.radians(60)
sx, sy = cx + int(r * math.sin(ang)), cy - int(r * math.cos(ang))
u.SetCursorPos(sx, sy)
time.sleep(0.5)
u.mouse_event(MON, 0, 0, 0, 0); time.sleep(0.1); u.mouse_event(UP, 0, 0, 0, 0)
print("clicked", sx, sy)
time.sleep(2.5)

ImageGrab.grab(all_screens=True).resize((1280, 800)).save(r"D:\QYD\dsh-file\.cache\rs-shots\after_click_reboot.png")
print("saved")
