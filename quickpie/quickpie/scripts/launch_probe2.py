import ctypes, subprocess, time
from pathlib import Path
from PIL import ImageGrab
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
w, h = u.GetSystemMetrics(0), u.GetSystemMetrics(1)
cx, cy = w // 2, h // 2
u.SetCursorPos(cx, cy)

exe = r"D:\QYD\dsh-file\apps\quickpie\dist\QuickPie\QuickPie.exe"
args = [exe, r"--user-data-dir=D:\QYD\dsh-file\apps\quickpie\dist\QuickPie\PortableData", "--no-sandbox"]
p = subprocess.Popen(args, cwd=str(Path(exe).parent), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(5.0)
print("alive:", p.poll() is None)
ImageGrab.grab(bbox=(cx-560, cy-560, cx+560, cy+560), all_screens=True).save(
    r"D:\QYD\dsh-file\apps\quickpie\docs\launch.png")
print("shot saved")
p.terminate()
