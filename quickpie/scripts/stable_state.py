import ctypes, os, subprocess, time
from pathlib import Path
from PIL import ImageGrab
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
W,H = u.GetSystemMetrics(0), u.GetSystemMetrics(1)
CX,CY = W//2, H//2
exe = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
base = Path(exe).parent
subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
time.sleep(1.0)
u.SetCursorPos(CX,CY); time.sleep(0.3)
env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
p = subprocess.Popen([exe, f"--user-data-dir={base}\\PortableData", "--no-sandbox"],
                     cwd=str(base), env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(6)
print("alive:", p.poll() is None)
ImageGrab.grab(bbox=(CX-500, CY-500, CX+500, CY+500), all_screens=True).resize((600,600)).save(
    r"D:\QYD\dsh-file\.cache\rs-shots\stable_state.png")
print("shot ok")
p.terminate()
