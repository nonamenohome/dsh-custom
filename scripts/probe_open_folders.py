import ctypes, subprocess, time
from PIL import ImageGrab
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
for target in [r"C:\Users\quyuedi\Downloads", r"C:\Users\quyuedi\Desktop"]:
    p = subprocess.Popen(["explorer.exe", target], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2.5)
    print(target, "-> explorer exited:", p.poll() is not None)
ImageGrab.grab(all_screens=True).resize((1280, 800)).save(r"D:\QYD\dsh-file\.cache\rs-shots\open_folders.png")
print("shot saved")
