import ctypes, os, subprocess, time
from pathlib import Path
from PIL import ImageGrab
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
W,H = u.GetSystemMetrics(0), u.GetSystemMetrics(1)
PROF = r"D:\QYD\dsh-file\.cache\qp-v74"
Path(PROF).mkdir(parents=True, exist_ok=True)
import shutil
shutil.copy2(r"D:\QYD\Tools\QuickPie\PortableData\data.json", Path(PROF)/"data.json")
exe = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
time.sleep(1.2)
u.SetCursorPos(W//2, H//2)
time.sleep(0.4)
env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
p = subprocess.Popen([exe, f"--user-data-dir={PROF}", "--no-sandbox"], cwd=str(Path(exe).parent),
                     env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(7)
print("alive:", p.poll() is None)
ImageGrab.grab(bbox=(W//2-330, H//2-330, W//2+330, H//2+330), all_screens=True).resize((560,560)).save(
    r"D:\QYD\dsh-file\.cache\rs-shots\hub-logo.png")
print("shot ok")
p.terminate()
