import ctypes, subprocess, time
from PIL import ImageGrab
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
w, h = u.GetSystemMetrics(0), u.GetSystemMetrics(1)
p = subprocess.Popen(["explorer.exe", r"D:\QYD\dsh-file"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(3.0)
print("explorer spawned, pid", p.pid, "exited:", p.poll() is not None)
ImageGrab.grab(all_screens=True).resize((1280, 800)).save(r"D:\QYD\dsh-file\.cache\rs-shots\open_workspace.png")
print("shot saved")
