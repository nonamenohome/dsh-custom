import os, shutil, subprocess, time
from pathlib import Path
from PIL import ImageGrab
import ctypes
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
W,H = u.GetSystemMetrics(0), u.GetSystemMetrics(1)

prof = Path(r"D:\QYD\dsh-file\.cache\qp-icons")
shutil.rmtree(prof, ignore_errors=True); prof.mkdir(parents=True, exist_ok=True)
shutil.copy2(r"D:\QYD\Tools\QuickPie\PortableData\data.json", prof/"data.json")

exe = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
time.sleep(1.2)
u.SetCursorPos(W//2, H//2); time.sleep(0.4)
env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
p = subprocess.Popen([exe, f"--user-data-dir={prof}", "--no-sandbox"], cwd=str(Path(exe).parent),
                     env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(7)
print("alive:", p.poll() is None)
ImageGrab.grab(bbox=(W//2-800, H//2-800, W//2+800, H//2+800), all_screens=True).resize((900,900)).save(
    r"D:\QYD\dsh-file\.cache\rs-shots\icons-state.png")
print("shot ok")
p.terminate()
