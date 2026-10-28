import ctypes, os, subprocess, time
from pathlib import Path
from PIL import ImageGrab
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
W,H = u.GetSystemMetrics(0), u.GetSystemMetrics(1)
exe = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
base = Path(exe).parent
subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
time.sleep(1.2)
u.SetCursorPos(W//2, H//2); time.sleep(0.3)
env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
p = subprocess.Popen([exe, f"--user-data-dir={base}\\PortableData", "--no-sandbox"],
                     cwd=str(base), env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(6.5)
print("alive:", p.poll() is None)
# 任务栏整条（底部 120 物理像素）
ImageGrab.grab(bbox=(0, H-120, W, H), all_screens=True).save(
    r"D:\QYD\dsh-file\.cache\rs-shots\taskbar.png")
print("taskbar shot ok")
p.terminate()
