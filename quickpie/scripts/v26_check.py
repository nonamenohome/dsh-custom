import ctypes, math, os, subprocess, time
from pathlib import Path
from PIL import ImageGrab
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
W,H = u.GetSystemMetrics(0), u.GetSystemMetrics(1)
CX,CY = W//2, H//2
exe = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
base = Path(exe).parent
log = base / "PortableData" / "open.log"
if log.exists(): log.unlink()

subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
time.sleep(1.2)
u.SetCursorPos(CX,CY); time.sleep(0.3)
env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
p = subprocess.Popen([exe, f"--user-data-dir={base}\\PortableData", "--no-sandbox"],
                     cwd=str(base), env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(6.5)
print("alive:", p.poll() is None)
ImageGrab.grab(bbox=(CX-450, CY-450, CX+450, CY+450), all_screens=True).resize((600,600)).save(
    r"D:\QYD\dsh-file\.cache\rs-shots\v26_launch.png")

a = math.radians(60)
sx,sy = CX+int(380*math.sin(a)), CY-int(380*math.cos(a))
u.SetCursorPos(sx,sy); time.sleep(0.6)
u.mouse_event(0x0002,0,0,0,0); time.sleep(0.08); u.mouse_event(0x0004,0,0,0,0)
time.sleep(3)
print("--- open.log ---")
print(log.read_text(encoding="utf-8") if log.exists() else "(无)")
p.terminate()
